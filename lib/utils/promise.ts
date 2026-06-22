// Utilidades de promesas

/** Espera n ms */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry con backoff exponencial */
export async function retry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 300, shouldRetry = () => true }: {
    maxAttempts?: number;
    baseDelayMs?: number;
    shouldRetry?: (err: unknown, attempt: number) => boolean;
  } = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !shouldRetry(err, attempt)) throw err;
      await sleep(baseDelayMs * Math.pow(2, attempt - 1));
    }
  }
  throw lastError;
}

/** Race con timeout: lanza si fn no resuelve en ms */
export function withTimeout<T>(fn: Promise<T>, ms: number, errorMessage = "Timeout"): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  );
  return Promise.race([fn, timeout]);
}

/** Ejecuta array de promesas en paralelo con concurrencia máxima */
export async function concurrentMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency = 3
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

/** Deferred: crea promesa con resolve/reject externos */
export function deferred<T>(): { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void } {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

/** Ejecuta fn exactamente una vez */
export function once<T>(fn: () => T): () => T {
  let called = false;
  let result: T;
  return () => {
    if (!called) { result = fn(); called = true; }
    return result;
  };
}
