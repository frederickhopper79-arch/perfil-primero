type FirestoreTimestamp = { toDate: () => Date };

/**
 * Safely converts a Firestore Timestamp, Date, or unknown value to a Date.
 * Returns null if the value is missing or cannot be converted.
 */
export function fromFirestoreDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as FirestoreTimestamp).toDate === "function") {
    return (value as FirestoreTimestamp).toDate();
  }
  if (typeof (value as { seconds: number }).seconds === "number") {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  return null;
}

/**
 * Returns the number of days remaining from a Firestore date value.
 * Returns 0 if expired or null.
 */
export function daysRemaining(value: unknown): number {
  const date = fromFirestoreDate(value);
  if (!date) return 0;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}
