import type { Category, ArticleKind } from './types';

/**
 * The ten editorial desks. Slugs match the WordPress category slugs; a
 * WordPress category with another slug still works and falls back to a
 * neutral identity (see categoryFromWp in lib/content/wordpress.ts).
 */
const desks: Omit<Category, 'path'>[] = [
  { slug: 'surveying-reality-capture', name: 'Surveying & Reality Capture', code: 'SRV', visual: 'triangulation', description: 'Total stations, mobile mapping, scanning workflows and the people who measure the world.' },
  { slug: 'gis-mapping', name: 'GIS & Mapping', code: 'GIS', visual: 'contours', description: 'Spatial data infrastructure, cartography, analysis platforms and the open-source GIS ecosystem.' },
  { slug: 'earth-observation', name: 'Earth Observation', code: 'EO', visual: 'orbit', description: 'Satellite missions, SAR and optical imagery, analysis-ready data and the downstream EO market.' },
  { slug: 'lidar-3d-scanning', name: 'LiDAR & 3D Scanning', code: 'LDR', visual: 'pointcloud', description: 'Airborne, terrestrial and mobile laser scanning, point-cloud processing and 3D capture.' },
  { slug: 'digital-twins-bim', name: 'Digital Twins & BIM', code: 'DTW', visual: 'wireframe', description: 'City-scale twins, BIM-GIS integration, asset information and infrastructure lifecycles.' },
  { slug: 'hydrography', name: 'Hydrography & Marine', code: 'HYD', visual: 'bathymetry', description: 'Multibeam, uncrewed surface vessels, seabed mapping and offshore surveying.' },
  { slug: 'gnss-positioning', name: 'GNSS & Positioning', code: 'PNT', visual: 'constellation', description: 'Satellite navigation, RTK and PPP corrections, resilience, timing and alternative PNT.' },
  { slug: 'geoai', name: 'GeoAI', code: 'AI', visual: 'classification', description: 'Machine learning on imagery and point clouds, foundation models and automated feature extraction.' },
  { slug: 'geospatial-technology', name: 'Geospatial Technology', code: 'TEC', visual: 'tiles', description: 'Standards, cloud-native formats, APIs, software and the infrastructure under the map.' },
  { slug: 'business-industry', name: 'Business & Industry', code: 'BIZ', visual: 'graticule', description: 'Markets, mergers, funding, policy and the companies shaping the geospatial sector.' },
];

export const categories: Category[] = desks.map((d) => ({ ...d, path: `/category/${d.slug}/` }));

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

/** Desks shown in the primary navigation (the rest live in the "More" menu). */
export const primaryNav = ['surveying-reality-capture', 'gis-mapping', 'earth-observation', 'lidar-3d-scanning', 'digital-twins-bim', 'geoai'];

export const kindLabel: Record<ArticleKind, string> = {
  news: 'News',
  analysis: 'Analysis',
  interview: 'Interview',
  feature: 'Feature',
  opinion: 'Opinion',
};

/** Kinds that belong to the Intelligence (long-read) layer. */
export const intelligenceKinds: ArticleKind[] = ['analysis', 'interview', 'feature', 'opinion'];

/** Short desk names for the section bar. */
export const deskShort: Record<string, string> = {"surveying-reality-capture": "Surveying", "gis-mapping": "GIS & Mapping", "earth-observation": "Earth Observation", "lidar-3d-scanning": "LiDAR", "digital-twins-bim": "Digital Twins", "hydrography": "Hydrography", "gnss-positioning": "GNSS", "geoai": "GeoAI", "geospatial-technology": "Technology", "business-industry": "Business"};
