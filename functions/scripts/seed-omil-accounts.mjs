import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault(),
  projectId: "perfil-primero"
});

const auth = getAuth();
const db = getFirestore();
const password = process.env.OMIL_SEED_PASSWORD || "OmilPerfilPrimero2026!";
const domain = process.env.OMIL_SEED_DOMAIN || "perfilprimero.cl";

const created = [];

for (let index = 1; index <= 30; index += 1) {
  const displayName = `Omil${index}`;
  const email = `omil${index}@${domain}`.toLowerCase();
  let user;

  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, {
      password,
      disabled: false,
      displayName,
      emailVerified: true
    });
  } catch {
    user = await auth.createUser({
      email,
      password,
      disabled: false,
      displayName,
      emailVerified: true
    });
  }

  await db.collection("users").doc(user.uid).set({
    email,
    displayName,
    role: "omil",
    status: "active",
    managedByAdmin: true,
    billingExempt: true,
    canCreateUnlimitedPostulants: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  created.push(`${displayName};${email};${password};${user.uid}`);
}

console.log("OMIL creadas/actualizadas:");
console.log("nombre;email;password;uid");
console.log(created.join("\n"));
