import { destinationFor } from '@/lib/ads/server';
import { forward } from '@/lib/server/tracking';
import { clientIp, ipKey, isBot } from '@/lib/server/request';
import { limits, rateLimit } from '@/lib/server/rate-limit';
import { absoluteUrl } from '@/lib/site';

/**
 * Click-through: records the click, then redirects. The destination comes
 * from the campaign on the server, never from the URL, so this can't be used
 * as an open redirect.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = new URL(req.url);
  const c = /^\d{1,12}$/.test(id) ? await destinationFor(id) : null;
  if (!c) return Response.redirect(absoluteUrl('/'), 302);
  const device = ['desktop', 'tablet', 'mobile'].includes(u.searchParams.get('d') ?? '') ? u.searchParams.get('d')! : 'desktop';
  if (!isBot(req) && rateLimit(`clk:${ipKey(clientIp(req))}`, limits.track).ok) {
    await forward('track', { creative: c.id, campaign: c.campaignId, placement: c.placement, type: 'click', device });
  }
  return new Response(null, { status: 302, headers: { location: c.url, 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
}
