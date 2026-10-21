import { issueToken, type FormKind } from '@/lib/server/form-token';
import { clientIp, ipKey, json } from '@/lib/server/request';
import { limits, rateLimit } from '@/lib/server/rate-limit';

export async function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get('kind') as FormKind;
  if (kind !== 'contact' && kind !== 'advertise') return json({ error: 'unknown form' }, 400);
  if (!rateLimit(`tok:${ipKey(clientIp(req))}`, limits.token).ok) return json({ error: 'rate' }, 429);
  return json({ token: issueToken(kind) });
}
