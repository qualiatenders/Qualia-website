import { placements } from '@/lib/ads/placements';

/** Placement registry for the WordPress plugin's campaign editor and the media kit. */
export function GET() {
  return Response.json(placements, { headers: { 'cache-control': 'public, max-age=300' } });
}
