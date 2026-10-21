import type { PlacementId } from './placements';

/** A creative as the browser sees it. The destination URL stays on the server. */
export type Creative = {
  id: string;
  campaignId: string;
  advertiser: string;
  placement: PlacementId;
  image: string;
  imageMobile?: string;
  alt: string;
  /** 1–10. 10 = exclusive: only the highest-priority creatives rotate. */
  priority: number;
  /** House promotions for GeoInformatics itself, rendered as HTML instead of a banner. */
  house?: 'advertise' | 'newsletter';
};

export type AdEvent = {
  creative: string;
  placement: PlacementId;
  type: 'impression' | 'viewable';
  device: 'desktop' | 'tablet' | 'mobile';
};
