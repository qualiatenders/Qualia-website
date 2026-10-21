import { z } from 'zod';
import { forward } from '@/lib/server/tracking';
import { clientIp, ipKey, isBot, isSameOrigin } from '@/lib/server/request';
import { limits, rateLimit } from '@/lib/server/rate-limit';

/** Anonymous article read, counted for the "Most read" ranking. */
export async function POST(req: Request) {
  const done = new Response(null, { status: 204 });
  if (!isSameOrigin(req) || isBot(req)) return done;
  if (!rateLimit(`view:${ipKey(clientIp(req))}`, limits.views).ok) return done;
  const parsed = z.object({ id: z.string().regex(/^\d{1,12}$/) }).safeParse(await req.json().catch(() => null));
  if (parsed.success) await forward('view', { post: parsed.data.id });
  return done;
}
