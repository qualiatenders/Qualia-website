import 'server-only';

/**
 * Eenvoudige sliding-window rate limiter in het geheugen van het proces.
 * Voldoende voor één Node-instantie (VPS). Draait de site op meerdere
 * instanties, vervang dit dan door een gedeelde store (bijv. Redis).
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
  quote: [
    { limit: 5, windowMs: 15 * 60 * 1000 },
    { limit: 20, windowMs: 24 * 60 * 60 * 1000 },
  ],
  contact: [
    { limit: 5, windowMs: 15 * 60 * 1000 },
    { limit: 20, windowMs: 24 * 60 * 60 * 1000 },
  ],
  token: [{ limit: 60, windowMs: 15 * 60 * 1000 }],
  login: [
    { limit: 5, windowMs: 15 * 60 * 1000 },
    { limit: 30, windowMs: 24 * 60 * 60 * 1000 },
  ],
} satisfies Record<string, Rule[]>;
