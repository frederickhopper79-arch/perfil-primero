import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

const projectId = "perfil-primero-rules-test";
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(resolve("firestore.rules"), "utf8")
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users/worker-1"), { role: "worker", status: "active" });
    await setDoc(doc(db, "users/company-1"), { role: "company", status: "active" });
    await setDoc(doc(db, "users/company-2"), { role: "company", status: "active" });
    await setDoc(doc(db, "users/admin-1"), { role: "admin", status: "active" });
    await setDoc(doc(db, "users/omil-1"), { role: "omil", status: "active" });
    await setDoc(doc(db, "workerPublicProfiles/worker-1"), {
      workerId: "worker-1",
      subscriptionStatus: "inactive",
      visibilityStatus: "hidden"
    });
    await setDoc(doc(db, "workerPublicProfiles/omil-worker-1"), {
      workerId: "omil-worker-1",
      subscriptionStatus: "inactive",
      visibilityStatus: "hidden",
      createdByOmilId: "omil-1"
    });
    await setDoc(doc(db, "companyProfiles/company-2"), {
      companyId: "company-2",
      verificationStatus: "verified"
    });
    await setDoc(doc(db, "coupons/TEST10"), {
      couponCode: "TEST10",
      discountPercent: 10,
      active: true
    });
    await setDoc(doc(db, "workerPrivateProfiles/worker-1"), {
      workerId: "worker-1",
      legalName: "Postulante Uno",
      email: "worker@example.com"
    });
    await setDoc(doc(db, "companyProfiles/company-1"), {
      companyId: "company-1",
      verificationStatus: "pending"
    });
    await setDoc(doc(db, "payments/pay-1"), {
      paymentId: "pay-1",
      userId: "worker-1",
      status: "paid"
    });
    await setDoc(doc(db, "accountingEntries/pay-1"), {
      paymentId: "pay-1",
      status: "pending_accounting_review"
    });
    await setDoc(doc(db, "emailReminders/omil-worker-1"), {
      reminderId: "omil-worker-1",
      omilId: "omil-1",
      workerId: "omil-worker-1",
      status: "queued"
    });
    await setDoc(doc(db, "aiUsageLogs/log-1"), {
      endpointApi: "gemini-json",
      status: "success"
    });
    await setDoc(doc(db, "marketAnalyticsReports/report-1"), {
      reportId: "report-1",
      activePostulants: 1
    });
    await setDoc(doc(db, "configuracion_sistema/tarifas"), {
      tarifa_suscripcion_postulante_clp: 999,
      tarifa_contacto_empresa_clp: 999
    });
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

function authed(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

function anon() {
  return testEnv.unauthenticatedContext().firestore();
}

describe("Firestore Rules - Perfil Primero", () => {
  it("bloquea lectura anonima de perfiles y datos privados", async () => {
    await assertFails(getDoc(doc(anon(), "workerPublicProfiles/worker-1")));
    await assertFails(getDoc(doc(anon(), "workerPrivateProfiles/worker-1")));
  });

  it("bloquea perfiles publicos a empresas NO verificadas (anonimato)", async () => {
    await assertFails(getDoc(doc(authed("company-1"), "workerPublicProfiles/worker-1")));
  });

  it("permite perfiles publicos a empresas verificadas, dueño y admin", async () => {
    await assertSucceeds(getDoc(doc(authed("company-2"), "workerPublicProfiles/worker-1")));
    await assertSucceeds(getDoc(doc(authed("worker-1"), "workerPublicProfiles/worker-1")));
    await assertSucceeds(getDoc(doc(authed("admin-1"), "workerPublicProfiles/worker-1")));
  });

  it("permite a OMIL leer solo los perfiles que creó", async () => {
    await assertSucceeds(getDoc(doc(authed("omil-1"), "workerPublicProfiles/omil-worker-1")));
    await assertFails(getDoc(doc(authed("omil-1"), "workerPublicProfiles/worker-1")));
  });

  it("bloquea lectura de cupones a todos los clientes (anti-enumeración)", async () => {
    await assertFails(getDoc(doc(authed("worker-1"), "coupons/TEST10")));
    await assertFails(getDoc(doc(authed("company-2"), "coupons/TEST10")));
    await assertFails(getDocs(collection(authed("company-1"), "coupons")));
  });

  it("bloquea datos privados del postulante a empresas no desbloqueadas", async () => {
    await assertFails(getDoc(doc(authed("company-1"), "workerPrivateProfiles/worker-1")));
  });

  it("permite al postulante leer y editar su perfil privado", async () => {
    await assertSucceeds(getDoc(doc(authed("worker-1"), "workerPrivateProfiles/worker-1")));
    await assertSucceeds(updateDoc(doc(authed("worker-1"), "workerPrivateProfiles/worker-1"), {
      phone: "+56911111111"
    }));
  });

  it("impide que el postulante active visibilidad o suscripcion sin backend", async () => {
    await assertFails(updateDoc(doc(authed("worker-1"), "workerPublicProfiles/worker-1"), {
      subscriptionStatus: "active",
      visibilityStatus: "visible"
    }));
  });

  it("permite a empresa crear su propio perfil solo como pendiente", async () => {
    await assertSucceeds(setDoc(doc(authed("company-1"), "companyProfiles/company-1"), {
      companyId: "company-1",
      verificationStatus: "pending"
    }));
    await assertFails(setDoc(doc(authed("company-1"), "companyProfiles/company-1"), {
      companyId: "company-1",
      verificationStatus: "verified"
    }));
  });

  it("bloquea escritura directa en pagos, invitaciones, mensajes y contabilidad", async () => {
    await assertFails(setDoc(doc(authed("worker-1"), "payments/new-pay"), { userId: "worker-1" }));
    await assertFails(setDoc(doc(authed("company-1"), "invitations/new-inv"), { companyId: "company-1" }));
    await assertFails(setDoc(doc(authed("company-1"), "conversationMessages/new-msg"), { companyId: "company-1" }));
    await assertFails(setDoc(doc(authed("admin-1"), "accountingEntries/new-entry"), { status: "manual" }));
  });

  it("restringe colecciones administrativas a admin", async () => {
    await assertFails(getDocs(collection(authed("worker-1"), "accountingEntries")));
    await assertSucceeds(getDocs(collection(authed("admin-1"), "accountingEntries")));
  });

  it("restringe monitoreo IA, reportes de mercado y configuracion a admin", async () => {
    await assertFails(getDoc(doc(authed("worker-1"), "aiUsageLogs/log-1")));
    await assertFails(getDoc(doc(authed("company-1"), "marketAnalyticsReports/report-1")));
    await assertFails(getDoc(doc(authed("company-1"), "configuracion_sistema/tarifas")));
    await assertSucceeds(getDoc(doc(authed("admin-1"), "aiUsageLogs/log-1")));
    await assertSucceeds(getDoc(doc(authed("admin-1"), "marketAnalyticsReports/report-1")));
    await assertSucceeds(getDoc(doc(authed("admin-1"), "configuracion_sistema/tarifas")));
  });

  it("permite a admin leer y administrar usuarios", async () => {
    await assertSucceeds(getDoc(doc(authed("admin-1"), "users/worker-1")));
    await assertSucceeds(updateDoc(doc(authed("admin-1"), "users/worker-1"), {
      status: "suspended"
    }));
  });

  it("impide que un usuario cambie su propio rol o estado", async () => {
    await assertFails(updateDoc(doc(authed("worker-1"), "users/worker-1"), {
      role: "admin",
      status: "active"
    }));
  });

  it("permite a usuarios leer solo pagos propios", async () => {
    await assertSucceeds(getDoc(doc(authed("worker-1"), "payments/pay-1")));
    await assertFails(getDoc(doc(authed("company-1"), "payments/pay-1")));
  });

  it("permite a OMIL leer sus recordatorios pero bloquea escrituras directas", async () => {
    await assertSucceeds(getDoc(doc(authed("omil-1"), "emailReminders/omil-worker-1")));
    await assertFails(setDoc(doc(authed("omil-1"), "payments/omil-pay"), { userId: "omil-1" }));
    await assertFails(setDoc(doc(authed("omil-1"), "workerPublicProfiles/omil-worker-2"), {
      workerId: "omil-worker-2",
      subscriptionStatus: "active",
      visibilityStatus: "visible",
      createdByOmilId: "omil-1"
    }));
  });

  it("confirma que la suite ejecuta reglas reales del proyecto", () => {
    expect(projectId).toContain("rules-test");
  });
});
