// Push notification helpers (web push via VAPID)

import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
import { app } from "./client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

let messaging: ReturnType<typeof getMessaging> | null = null;

function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch {
      return null;
    }
  }
  return messaging;
}

export async function requestPushPermission(): Promise<string | null> {
  const m = getMessagingInstance();
  if (!m) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const token = await getToken(m, { vapidKey: VAPID_PUBLIC_KEY });
    return token;
  } catch {
    return null;
  }
}

export function onPushMessage(callback: (payload: MessagePayload) => void): (() => void) | undefined {
  const m = getMessagingInstance();
  if (!m) return;
  return onMessage(m, callback);
}

export async function savePushToken(uid: string, token: string): Promise<void> {
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const { db } = await import("./client");
  await setDoc(
    doc(db, "users", uid, "pushTokens", token),
    { token, platform: "web", createdAt: serverTimestamp() },
    { merge: true }
  );
}
