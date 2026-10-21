import 'server-only';

/**
 * Sliding-window rate limiter in process memory. Enough for a single Node
 * instance; with several instances, swap in a shared store (e.g. Redis).
 */
type Bucket = number[];
const store = new Map<string, Bucket>();
let lastSweep = Date.now();

export type Rule = { limit: number; windowMs: number };

export function rateLimit(key: string, rules: Rule[]): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const maxWindow = Math.max(...rules.map((r) => r.windowMs));
  const hits = (store.get(key) ?? []).filter((t) => now - t < maxWindow);
  for (const r of rules) {
    const inWindow = hits.filter((t) => now - t < r.windowMs);
    if (inWindow.length >= r.limit) {
      const retryAfter = Math.ceil((r.windowMs - (now - inWindow[0]!)) / 1000);
      store.set(key, hits);
      return { ok: false, retryAfter: Math.max(1, retryAfter) };
    }
  }
  hits.push(now);
  store.set(key, hits);
  return { ok: true };
}

function sweep(now: number) {
  if (now - lastSweep < 10 * 60 * 1000) return;
  lastSweep = now;
  for (const [k, v] of store) if (!v.length || now - v[v.length - 1]! > 24 * 60 * 60 * 1000) store.delete(k);
}

export const limits = {
  form: [
    { limit: 5, windowMs: 15 * 60 * 1000 },
    { limit: 20, windowMs: 24 * 60 * 60 * 1000 },
  ],
  newsletter: [
    { limit: 5, windowMs: 15 * 60 * 1000 },
    { limit: 15, windowMs: 24 * 60 * 60 * 1000 },
  ],
  token: [{ limit: 60, windowMs: 15 * 60 * 1000 }],
  // Ad events and page views: generous, but stops a single client inflating counts.
  track: [{ limit: 300, windowMs: 10 * 60 * 1000 }],
  views: [{ limit: 60, windowMs: 10 * 60 * 1000 }],
} satisfies Record<string, Rule[]>;
