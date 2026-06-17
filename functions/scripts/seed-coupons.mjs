import { initializeApp, applicationDefault } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault(),
  projectId: "perfil-primero"
});

const db = getFirestore();
const now = Date.now();

const coupons = [
  {
    couponCode: "BIENVENIDA50",
    name: "Bienvenida 50%",
    discountPercent: 50,
    maxUses: 200,
    usedCount: 0,
    active: true,
    expiresAt: Timestamp.fromMillis(now + 1000 * 60 * 60 * 24 * 90)
  },
  {
    couponCode: "LAUNCH100",
    name: "Lanzamiento 100%",
    discountPercent: 100,
    maxUses: 50,
    usedCount: 0,
    active: true,
    expiresAt: Timestamp.fromMillis(now + 1000 * 60 * 60 * 24 * 30)
  }
];

for (const coupon of coupons) {
  await db.collection("coupons").doc(coupon.couponCode).set(
    {
      ...coupon,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

console.log(`Cupones cargados: ${coupons.map((coupon) => coupon.couponCode).join(", ")}`);
