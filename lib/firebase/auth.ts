import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./client";
import type { UserRole } from "@/lib/domain/types";

export async function registerWithEmail(email: string, password: string, role: UserRole) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Correo electrónico inválido.");
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserRecord(credential.user.uid, email, role);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle(role: UserRole) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  await createUserRecord(credential.user.uid, credential.user.email ?? "", role);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserRole(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data().role as UserRole | undefined) : undefined;
}

export async function ensureUserRecord(uid: string, email: string, role: UserRole) {
  await createUserRecord(uid, email, role);
}

function generateReferralCode(uid: string): string {
  return uid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
}

async function createUserRecord(uid: string, email: string, role: UserRole, refCode?: string) {
  const userRef = doc(db, "users", uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    const existingData = existing.data();
    await setDoc(
      userRef,
      {
        email: existingData.email ?? email,
        role: existingData.role ?? role,
        status: existingData.status ?? "active",
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    return;
  }

  const referralCode = generateReferralCode(uid);
  await setDoc(
    userRef,
    {
      email,
      role,
      status: "active",
      referralCode,
      referredBy: refCode ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getReferralCode(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().referralCode as string ?? null) : null;
}
