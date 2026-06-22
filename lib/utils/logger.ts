const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (msg: string, data?: Record<string, unknown>) => {
    if (isDev) console.info(`[INFO] ${msg}`, data ?? "");
  },
  warn: (msg: string, data?: Record<string, unknown>) => {
    if (isDev) console.warn(`[WARN] ${msg}`, data ?? "");
  },
  error: (msg: string, err?: unknown) => {
    if (isDev) console.error(`[ERROR] ${msg}`, err ?? "");
  },
};
