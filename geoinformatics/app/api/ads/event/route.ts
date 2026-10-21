import { z } from 'zod';
import { placements } from '@/lib/ads/placements';
import { destinationFor } from '@/lib/ads/server';
import { forward } from '@/lib/server/tracking';
import { clientIp, ipKey, isBot, isSameOrigin } from '@/lib/server/request';
import { limits, rateLimit } from '@/lib/server/rate-limit';

const schema = z.object({
  creative: z.string().regex(/^\d{1,12}$/),
  placement: z.enum(placements.map((p) => p.id) as [string, ...string[]]),
  type: z.enum(['impression', 'viewable']),
  device: z.enum(['desktop', 'tablet', 'mobile']),
});

/** Impression / viewable-impression beacon from AdRotator. Always 204: beacons don't read responses. */
export async function POST(req: Request) {
  const done = new Response(null, { status: 204 });
  if (!isSameOrigin(req) || isBot(req)) return done;
  if (!rateLimit(`trk:${ipKey(clientIp(req))}`, limits.track).ok) return done;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return done;
  // Only count creatives that are actually live in this placement.
  const c = await destinationFor(parsed.data.creative);
  if (!c || c.placement !== parsed.data.placement) return done;
  await forward('track', { ...parsed.data, campaign: c.campaignId });
  return done;
}
