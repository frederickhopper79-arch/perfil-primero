#!/usr/bin/env node
/**
 * set-admin-role.js
 * Asigna role:"admin" en Firestore al usuario indicado por email.
 *
 * Uso:
 *   node scripts/set-admin-role.js fabiancarrillo@gmail.com
 *
 * Requiere: Firebase CLI autenticado con la cuenta del proyecto
 *   npx firebase login  (si no está logueado)
 *
 * Usa Application Default Credentials del CLI — no requiere service account.
 */

const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "perfil-primero";
const TARGET_EMAIL = process.argv[2];

if (!TARGET_EMAIL) {
  console.error("Uso: node scripts/set-admin-role.js <email>");
  process.exit(1);
}

initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
});

const auth = getAuth();
const db = getFirestore();

async function main() {
  console.log(`\n🔍 Buscando usuario: ${TARGET_EMAIL}`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(TARGET_EMAIL);
  } catch (err) {
    console.error(`\n❌ No se encontró el usuario "${TARGET_EMAIL}" en Firebase Auth.`);
    console.error("   Verifica que haya iniciado sesión en la app al menos una vez.");
    process.exit(1);
  }

  const uid = userRecord.uid;
  console.log(`✓ UID encontrado: ${uid}`);

  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();

  const currentRole = snap.exists ? snap.data()?.role : "(documento no existe)";
  console.log(`· Rol actual: ${currentRole}`);

  if (currentRole === "admin") {
    console.log("\n✅ El usuario ya tiene role:admin — no se requieren cambios.\n");
    process.exit(0);
  }

  await userRef.set(
    {
      role: "admin",
      email: TARGET_EMAIL,
      displayName: userRecord.displayName || TARGET_EMAIL,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`\n✅ role:"admin" asignado correctamente a ${TARGET_EMAIL}`);
  console.log(`   Documento: users/${uid}\n`);
}

main().catch((err) => {
  console.error("\n❌ Error inesperado:", err.message);
  process.exit(1);
});
