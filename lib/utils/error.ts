// Utilidades de manejo de errores

/** Extrae mensaje legible de cualquier tipo de error */
export function errorMessage(err: unknown): string {
  if (!err) return "Error desconocido";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return String(err);
}

/** Mapea códigos de error de Firebase a mensajes en español */
export function firebaseErrorMessage(code: string): string {
  const MESSAGES: Record<string, string> = {
    "auth/email-already-in-use": "Este email ya está registrado. ¿Quieres iniciar sesión?",
    "auth/wrong-password": "Contraseña incorrecta. Intenta nuevamente.",
    "auth/user-not-found": "No encontramos una cuenta con este email.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos antes de volver a intentar.",
    "auth/network-request-failed": "Sin conexión a internet. Revisa tu red.",
    "auth/invalid-email": "El formato del email no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/popup-closed-by-user": "Se cerró la ventana de inicio de sesión. Intenta nuevamente.",
    "auth/account-exists-with-different-credential": "Ya existe una cuenta con este email usando otro método de ingreso.",
    "auth/invalid-credential": "Credenciales inválidas. Verifica tus datos.",
    "auth/user-disabled": "Esta cuenta ha sido desactivada. Contacta soporte.",
    "auth/requires-recent-login": "Por seguridad, inicia sesión nuevamente para realizar esta acción.",
    "permission-denied": "No tienes permiso para realizar esta acción.",
    "not-found": "El documento solicitado no existe.",
    "already-exists": "Ya existe un registro con estos datos.",
    "resource-exhausted": "Servicio temporalmente saturado. Intenta en unos minutos.",
    "unavailable": "Servicio no disponible. Revisa tu conexión.",
    "deadline-exceeded": "La operación tardó demasiado. Intenta nuevamente.",
    "cancelled": "Operación cancelada.",
    "internal": "Error interno del servidor. Contáctanos si el problema persiste.",
    "unauthenticated": "Debes iniciar sesión para continuar.",
    "invalid-argument": "Datos inválidos. Revisa el formulario.",
    "out-of-range": "Valor fuera del rango permitido.",
  };
  return MESSAGES[code] ?? `Error inesperado (${code}). Intenta nuevamente.`;
}

/** Retorna true si el error es de red */
export function isNetworkError(err: unknown): boolean {
  const msg = errorMessage(err).toLowerCase();
  return msg.includes("network") || msg.includes("fetch") || msg.includes("offline") || msg.includes("conexión");
}

/** Retorna true si el error es de permisos */
export function isPermissionError(err: unknown): boolean {
  const msg = errorMessage(err).toLowerCase();
  return msg.includes("permission") || msg.includes("unauthenticated") || msg.includes("unauthorized");
}

/** Log de error con contexto (no lanzar en producción) */
export function logError(context: string, err: unknown, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, err, extra);
  }
  // En producción podrías enviar a Sentry / Firebase Crashlytics
}
