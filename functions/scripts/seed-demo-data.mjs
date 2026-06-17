import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault(),
  projectId: "perfil-primero"
});

const auth = getAuth();
const db = getFirestore();
const password = "Demo1234!";

const postulants = [
  ["valentina.rojas@demo.perfilprimero.cl", "Valentina Rojas", "Especialista en marketing digital y performance", "Marketing y Publicidad", ["Google Ads", "Meta Ads", "GA4", "Looker Studio"], 1200000, 1800000],
  ["matias.araya@demo.perfilprimero.cl", "Matias Araya", "Supervisor de operaciones logisticas", "Abastecimiento y Logistica", ["WMS", "Excel", "Turnos", "Inventario"], 1000000, 1450000],
  ["camila.fuentes@demo.perfilprimero.cl", "Camila Fuentes", "Analista contable y administrativo", "Administracion, Contabilidad y Finanzas", ["SII", "ERP", "Excel", "Facturacion"], 850000, 1150000],
  ["diego.morales@demo.perfilprimero.cl", "Diego Morales", "Desarrollador frontend React", "Tecnologia, Sistemas y Telecomunicaciones", ["React", "Next.js", "TypeScript", "Firebase"], 1500000, 2200000],
  ["fernanda.silva@demo.perfilprimero.cl", "Fernanda Silva", "Ejecutiva de atencion al cliente y postventa", "Atencion al Cliente, Call Center y Telemarketing", ["CRM", "Postventa", "Zendesk", "Ventas"], 750000, 980000]
];

const companies = [
  ["reclutamiento@nortedigital.demo", "Norte Digital SpA", "76.345.210-8", "Marketing y Publicidad"],
  ["personas@andesoperaciones.demo", "Andes Operaciones SpA", "77.812.904-1", "Abastecimiento y Logistica"]
];

const createdCompanies = [];

await ensureUser("admin@perfilprimero.cl", "admin", "Administrador Perfil Primero");

for (const item of postulants) {
  const [email, name, headline, area, skills, salaryMin, salaryMax] = item;
  const user = await ensureUser(email, "worker", name);

  await db.collection("workerPublicProfiles").doc(user.uid).set({
    workerId: user.uid,
    profileCode: `PP-${user.uid.slice(0, 4).toUpperCase()}`,
    displayName: headline,
    headline,
    summary: `CV demo de ${name}. Experiencia comprobable en ${area}, foco operativo y disponibilidad para entrevistas trazables.`,
    skills,
    sectors: [area],
    cvAnalysisSummary: `La IA extrae experiencia, habilidades y rango de renta desde el CV demo de ${name}.`,
    experienceLevel: "mid",
    yearsOfExperience: 5,
    region: "Region Metropolitana",
    city: "Santiago",
    workModes: ["hybrid", "remote"],
    expectedSalaryMin: salaryMin,
    expectedSalaryMax: salaryMax,
    currency: "CLP",
    availability: "listening",
    visibilityStatus: "visible",
    subscriptionStatus: "active",
    assessmentScores: { english: 78, spanish: 91, personality: 84 },
    profileExpiresAt: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await db.collection("workerPrivateProfiles").doc(user.uid).set({
    workerId: user.uid,
    legalName: name,
    preferredName: name.split(" ")[0],
    email,
    phone: "+56 9 5555 0000",
    portfolioLinks: ["https://perfil-primero.web.app"],
    originalCvText: `Curriculum demo de ${name}. Cargo objetivo: ${headline}. Area: ${area}. Habilidades: ${skills.join(", ")}.`,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

for (const item of companies) {
  const [email, companyName, taxId, industry] = item;
  const user = await ensureUser(email, "company", companyName);
  createdCompanies.push({ uid: user.uid, companyName, industry });

  await db.collection("companyProfiles").doc(user.uid).set({
    companyId: user.uid,
    companyName,
    legalName: companyName,
    taxId,
    website: "https://perfil-primero.web.app",
    logoUrl: "",
    region: "Region Metropolitana",
    city: "Santiago",
    industry,
    size: companyName.includes("Norte") ? "11-50" : "51-200",
    verificationStatus: "verified",
    billingStatus: "active",
    reputationScore: companyName.includes("Norte") ? 96 : 92,
    responseRate: companyName.includes("Norte") ? 88 : 81,
    averageResponseTimeHours: companyName.includes("Norte") ? 18 : 24,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

const offers = [
  ["Especialista SEO", "Marketing y Publicidad", 1, 1000000, 1500000, 0],
  ["Analista paid media", "Marketing y Publicidad", 2, 1200000, 1900000, 0],
  ["Disenador UX/UI", "Diseno", 1, 1300000, 1800000, 0],
  ["Desarrollador frontend", "Tecnologia, Sistemas y Telecomunicaciones", 1, 1600000, 2300000, 0],
  ["Ejecutivo comercial B2B", "Comercial, Ventas y Negocios", 3, 850000, 1300000, 0],
  ["Supervisor logistico", "Abastecimiento y Logistica", 2, 1000000, 1450000, 1],
  ["Analista inventario", "Produccion y Manufactura", 1, 850000, 1200000, 1],
  ["Coordinador transporte", "Abastecimiento y Logistica", 1, 950000, 1350000, 1],
  ["Analista contable operaciones", "Administracion, Contabilidad y Finanzas", 1, 900000, 1250000, 1],
  ["Encargado atencion clientes", "Atencion al Cliente, Call Center y Telemarketing", 2, 700000, 950000, 1]
];

for (const [index, item] of offers.entries()) {
  const [title, area, vacancies, salaryMin, salaryMax, companyIndex] = item;
  const company = createdCompanies[companyIndex];
  const offerRef = db.collection("jobOffers").doc(`demo-oferta-${index + 1}`);
  await offerRef.set({
    jobOfferId: offerRef.id,
    companyId: company.uid,
    title,
    area,
    region: "Region Metropolitana",
    city: "Santiago",
    workMode: "hybrid",
    contractType: "full_time",
    salaryMin,
    salaryMax,
    currency: "CLP",
    vacanciesTotal: vacancies,
    vacanciesAvailable: vacancies,
    description: `Oferta demo ${title} publicada por ${company.companyName}.`,
    requirements: "Experiencia comprobable, comunicacion clara y disponibilidad para entrevista web.",
    visibilityStatus: "visible",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

console.log(`Demo creado. Password comun: ${password}. Admin Firebase: admin@perfilprimero.cl / ${password}. La consola admin exige cuenta Firebase con rol admin.`);

async function ensureUser(email, role, displayName) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      displayName
    });
  }

  await db.collection("users").doc(user.uid).set({
    email,
    role,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  return user;
}
