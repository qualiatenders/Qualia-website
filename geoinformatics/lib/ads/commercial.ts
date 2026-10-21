import 'server-only';

/**
 * Commercial facts that must be verified before they are published.
 * Nothing here has a default: until the publisher fills these in, the
 * Advertise page and the media kit say "on request" instead of a number.
 *
 *   AUDIENCE_STATS='[{"label":"Monthly page views","value":"…","source":"Google Analytics, Jan–Mar 2027"}]'
 *   RATE_CARD='{"home-takeover":"€… per day","sidebar-rectangle":"€… CPM"}'
 *   CREATIVE_SPECS (optional override of the default file requirements)
 */
export type Stat = { label: string; value: string; source: string };

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw?.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn('[geoinformatics] Could not parse commercial setting; ignoring it.');
    return fallback;
  }
}

export const audienceStats = (): Stat[] => parse<Stat[]>(process.env.AUDIENCE_STATS, []).filter((s) => s.label && s.value && s.source);

export const rateCard = (): Record<string, string> => parse<Record<string, string>>(process.env.RATE_CARD, {});

export const creativeSpecs = [
  'Formats: JPG, PNG, GIF or WebP. HTML5 on request.',
  'Maximum file size 150 KB (300 KB for the premium takeover).',
  'Deliver desktop and mobile creatives at the exact sizes listed; supply 2× files for sharp display on high-density screens.',
  'One landing URL per creative. UTM parameters are welcome.',
  'Animation max. 15 seconds, no audio, no auto-expanding units.',
  'Creatives are delivered at least 3 working days before the campaign start.',
];
