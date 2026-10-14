import { issueToken, type FormKind } from '@/lib/server/form-token';
import { clientIp, ipKey, json } from '@/lib/server/request';
import { rateLimit, limits } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get('kind');
  if (kind !== 'quote' && kind !== 'contact') return json({ error: 'Onbekend formulier.' }, 400);
  const rl = rateLimit(`token:${ipKey(clientIp(req))}`, limits.token);
  if (!rl.ok) return json({ error: 'Te veel verzoeken.' }, 429, { 'retry-after': String(rl.retryAfter) });
  return json({ token: issueToken(kind as FormKind) });
}
