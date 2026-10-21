const url = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Publisher details. Contact details are only rendered when configured, so
 * nothing on the site is made up.
 */
export const site = {
  name: 'GeoInformatics',
  tagline: 'The global authority in geospatial news & intelligence',
  description:
    'GeoInformatics covers surveying, GIS, Earth observation, LiDAR, digital twins, hydrography, GNSS and GeoAI for the professionals who build the geospatial industry.',
  url,
  locale: 'en',
  email: {
    editorial: process.env.NEXT_PUBLIC_EMAIL_EDITORIAL?.trim() || '',
    advertising: process.env.NEXT_PUBLIC_EMAIL_ADVERTISING?.trim() || '',
  },
  publisher: {
    legalName: process.env.NEXT_PUBLIC_PUBLISHER_NAME?.trim() || '',
    address: process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS?.trim() || '',
    registration: process.env.NEXT_PUBLIC_PUBLISHER_REGISTRATION?.trim() || '',
  },
  social: {
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN?.trim() || '',
    x: process.env.NEXT_PUBLIC_SOCIAL_X?.trim() || '',
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE?.trim() || '',
  },
} as const;

export const absoluteUrl = (path = '/') => `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
