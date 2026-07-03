/**
 * Script de bootstrap — crea el primer admin de Perfil Primero.
 *
 * Uso:
 *   ADMIN_EMAIL=admin@perfil-primero.cl ADMIN_PASSWORD=TuClave2026! node functions/scripts/create-admin.mjs
 *
 * Variables de entorno opcionales:
 *   ADMIN_NAME   — nombre a mostrar (por defecto "Administrador")
 */

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault(),
  projectId: "perfil-primero"
});

const auth = getAuth();
const db = getFirestore();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const displayName = process.env.ADMIN_NAME || "Administrador";

if (!email || !password) {
  console.error("❌  Faltan variables de entorno:");
  console.error("   ADMIN_EMAIL=tu@correo.cl ADMIN_PASSWORD=TuClave2026! node functions/scripts/create-admin.mjs");
  process.exit(1);
}

if (password.length < 8) {
  console.error("❌  La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

console.log(`\n🔧  Creando administrador: ${email} …\n`);

let uid;

try {
  // Intentar obtener usuario existente
  const existing = await auth.getUserByEmail(email);
  uid = existing.uid;
  await auth.updateUser(uid, { password, disabled: false, displayName, emailVerified: true });
  console.log(`ℹ️   Usuario ya existía en Auth — contraseña y nombre actualizados. UID: ${uid}`);
} catch (err) {
  if (err.code === "auth/user-not-found") {
    // Crear usuario nuevo
    const created = await auth.createUser({
      email,
      password,
      disabled: false,
      displayName,
      emailVerified: true
    });
    uid = created.uid;
    console.log(`✅  Usuario creado en Firebase Auth. UID: ${uid}`);
  } else {
    console.error("❌  Error en Firebase Auth:", err.message);
    process.exit(1);
  }
}

// Crear / actualizar documento en Firestore
await db.collection("users").doc(uid).set(
  {
    email,
    displayName,
    role: "admin",
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastLoginAt: FieldValue.serverTimestamp()
  },
  { merge: true }
);

console.log(`✅  Documento Firestore users/${uid} con role=admin creado/actualizado.`);
console.log(`\n🎉  Admin listo. Entra en:\n    https://perfil-primero.web.app/consola-admin\n`);
console.log(`    Email:      ${email}`);
console.log(`    Contraseña: ${password}\n`);
