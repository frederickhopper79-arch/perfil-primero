// Firebase Storage upload helpers

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./client";

const storage = getStorage(app);

export const ALLOWED_MIME_TYPES = {
  cv: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  image: ["image/jpeg", "image/png", "image/webp"],
};

export const MAX_SIZE_BYTES = {
  cv: 5 * 1024 * 1024,      // 5 MB
  image: 2 * 1024 * 1024,   // 2 MB
};

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  sizeBytes: number;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  pct: number;
}

export function uploadFile(
  file: File,
  storagePath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    task.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress({ bytesTransferred: snapshot.bytesTransferred, totalBytes: snapshot.totalBytes, pct });
        }
      },
      (error) => reject(error),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          resolve({
            downloadUrl,
            storagePath,
            sizeBytes: file.size,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

export function validateFile(
  file: File,
  type: keyof typeof ALLOWED_MIME_TYPES
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES[type].includes(file.type)) {
    return { valid: false, error: `Tipo de archivo no permitido. Use: ${ALLOWED_MIME_TYPES[type].join(", ")}` };
  }
  if (file.size > MAX_SIZE_BYTES[type]) {
    const maxMb = MAX_SIZE_BYTES[type] / 1024 / 1024;
    return { valid: false, error: `El archivo no puede superar ${maxMb} MB` };
  }
  return { valid: true };
}

export function cvStoragePath(workerId: string): string {
  return `cvs/${workerId}/cv_${Date.now()}.pdf`;
}

export function avatarStoragePath(userId: string): string {
  return `avatars/${userId}/avatar_${Date.now()}.jpg`;
}
