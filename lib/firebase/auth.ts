import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./client";
import type { UserRole } from "@/lib/domain/types";

export async function registerWithEmail(email: string, password: string, role: UserRole) {
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
  const credential = await signInWithPopup(auth, provider);
  await createUserRecord(credential.user.uid, credential.user.email ?? "", role);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function getUserRole(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data().role as UserRole | undefined) : undefined;
}

export async function ensureUserRecord(uid: string, email: string, role: UserRole) {
  await createUserRecord(uid, email, role);
}

async function createUserRecord(uid: string, email: string, role: UserRole) {
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

  await setDoc(
    userRef,
    {
      email,
      role,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    },
    { merge: true }
  );
}
