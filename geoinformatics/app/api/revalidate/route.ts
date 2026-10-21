import crypto from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { platformSecret } from '@/lib/server/config';
import { json } from '@/lib/server/request';

/**
 * Called by the WordPress plugin on publish, update, unpublish, campaign
 * changes and event edits, so changes appear within seconds instead of
 * waiting for the cache to expire.
 * Body: { tags?: string[], paths?: string[] }
 */
export async function POST(req: Request) {
  const secret = platformSecret();
  const given = req.headers.get('x-gi-secret') ?? '';
  const ok = secret && given.length === secret.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return json({ ok: false }, 401);
  const body = (await req.json().catch(() => ({}))) as { tags?: unknown; paths?: unknown };
  const tags = (Array.isArray(body.tags) ? body.tags : ['wp']).filter((t): t is string => typeof t === 'string' && /^[\w:.-]{1,120}$/.test(t)).slice(0, 50);
  const paths = (Array.isArray(body.paths) ? body.paths : []).filter((p): p is string => typeof p === 'string' && p.startsWith('/') && p.length < 500).slice(0, 50);
  tags.forEach((t) => revalidateTag(t));
  paths.forEach((p) => revalidatePath(p));
  return json({ ok: true, tags, paths });
}
