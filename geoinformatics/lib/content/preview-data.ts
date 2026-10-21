import type { ArticleKind, EventItem, Organization } from '@/lib/types';

/**
 * PREVIEW CONTENT — used only while WORDPRESS_URL is not set.
 *
 * Test edition built from real GeoInformatics news (geoinformatics.com,
 * September–October 2026). Headlines and teasers follow the published
 * articles; the bodies are short summaries of what those articles report,
 * and every story links to the original. Slugs are the original WordPress
 * slugs, so the URLs match the live site. Images are illustrative renders
 * (scripts/render-imagery.py), not the articles' own photographs.
 * Dates marked "≈" in comments are approximate.
 */

export type PreviewArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  kind: ArticleKind;
  /** ISO publication date. */
  date: string;
  body: string[];
  image: string;
  featured?: 'lead' | 'secondary';
  breaking?: boolean;
  sponsored?: string;
  tags?: string[];
};

const p = (...paras: string[]) => paras;

export const SOURCE_BASE = 'https://www.geoinformatics.com';

export const previewArticles: PreviewArticle[] = [
  {
    slug: 'lidar-reveals-20000-amazonian-precolonial-earthworks',
    title: 'LiDAR reveals 20,000 Amazonian precolonial earthworks',
    excerpt: 'A study published in Nature reports the identification of more than 20,000 precolonial earthworks in Southwest Amazonia, mapped with airborne laser scanning beneath the forest canopy.',
    category: 'lidar-3d-scanning',
    kind: 'news',
    date: '2026-09-17T09:00:00Z',
    image: 'pointcloud-2',
    featured: 'lead',
    tags: ['LiDAR', 'archaeology', 'Amazon'],
    body: p(
      'A study published in Nature on 16 September 2026 reports the identification of more than 20,000 precolonial earthworks in Southwest Amazonia.',
      'The structures were mapped with airborne LiDAR, which records laser returns that pass through gaps in the forest canopy and makes it possible to model the ground surface underneath dense vegetation.',
      '## Why it matters',
      'The scale of the findings shows how airborne laser scanning has become a core instrument for landscape archaeology, revealing human modification of areas long assumed to be largely untouched forest.',
      '> Airborne laser scanning makes the ground beneath the canopy visible at landscape scale.',
    ),
  },
  {
    slug: 'satellogic-launches-first-merlin-satellite-multiple-newsats',
    title: 'Satellogic launches first Merlin satellite and multiple NewSats',
    excerpt: 'Satellogic has put its first Merlin satellite and three NewSat spacecraft into orbit. Merlin is designed as a global detection layer with 1 m-class imagery and onboard AI alerts.',
    category: 'earth-observation',
    kind: 'news',
    date: '2026-10-02T08:00:00Z',
    image: 'earth-1',
    featured: 'secondary',
    tags: ['satellites', 'Satellogic', 'AI'],
    body: p(
      'Satellogic launched its first Merlin satellite and three NewSat spacecraft on 1 October 2026.',
      'Merlin is meant to serve as a global detection layer, combining 1 m-class imagery with onboard AI that generates alerts. Full operations are targeted for the second half of 2027.',
      '## Next steps',
      'Merlin.01 has entered its Launch and Early Orbit Phase (LEOP). Payload testing and commissioning are scheduled to begin once that phase is complete, in mid-October 2026.',
    ),
  },
  {
    slug: 'hexagon-to-acquire-rocscience',
    title: 'Hexagon to acquire Rocscience',
    excerpt: 'Hexagon AB has announced that it has signed an agreement to acquire Rocscience, the geotechnical engineering software company.',
    category: 'business-industry',
    kind: 'news',
    date: '2026-10-10T07:30:00Z',
    image: 'relief-1',
    featured: 'secondary',
    tags: ['Hexagon', 'M&A', 'geotechnics'],
    body: p(
      'Hexagon AB announced that it has signed an agreement to acquire Rocscience.',
      'Rocscience develops software for geotechnical engineering. The announcement did not disclose deal terms in the material available for this preview.',
    ),
  },
  {
    slug: 'hesai-launches-kosmo-3d-world-data-engine',
    title: 'Hesai launches Kosmo 3D World Data Engine for reality capture and physical AI',
    excerpt: 'Hesai has introduced the Kosmo One spatial camera together with the cloud-based Kosmo World processing environment.',
    category: 'lidar-3d-scanning',
    kind: 'news',
    date: '2026-10-16T09:00:00Z',
    image: 'pointcloud-3',
    tags: ['LiDAR', 'reality capture', 'robotics'],
    body: p(
      'Hesai has introduced Kosmo, a platform that pairs the Kosmo One spatial camera with the cloud-based Kosmo World processing environment.',
      'Kosmo One integrates high-resolution LiDAR, an 8K imaging system and an inertial measurement unit (IMU). The platform targets reality capture for robotics and digital twins rather than aerial mapping.',
    ),
  },
  {
    slug: 'trustpoint-and-calian-demonstrate-new-c-band-gnss-antenna-for-gps-independent-positioning',
    title: 'TrustPoint and Calian demonstrate new C-band GNSS antenna',
    excerpt: 'TrustPoint and Calian have demonstrated a commercially manufacturable C-band GNSS antenna receiving live satellite signals.',
    category: 'gnss-positioning',
    kind: 'news',
    date: '2026-10-15T08:00:00Z',
    image: 'earth-2',
    tags: ['GNSS', 'LEO PNT', 'resilience'],
    body: p(
      'TrustPoint and Calian have demonstrated a C-band GNSS antenna that received live signals from TrustPoint satellites.',
      'TrustPoint is building a Low Earth Orbit navigation system intended as an alternative to GPS. The companies point to applications in surveying and critical infrastructure, where independent positioning sources add resilience.',
    ),
  },
  {
    slug: 'trimble-launches-st30-smart-target-with-gnss',
    title: 'Trimble launches ST30 smart target with GNSS',
    excerpt: 'Trimble has introduced the ST30 smart target, combining optical prism tracking, tilt compensation, automated rod height measurement and integrated GNSS in a single unit.',
    category: 'surveying-reality-capture',
    kind: 'news',
    date: '2026-10-13T08:00:00Z',
    image: 'topomap-1',
    tags: ['Trimble', 'total station', 'GNSS'],
    body: p(
      'Trimble has introduced the ST30 smart target, a surveying device that combines optical prism tracking, tilt compensation, automated rod height measurement and integrated GNSS in a single unit.',
      'The company plans global dealer availability in Q4 2026. The GNSS option will be delivered as a separate subscription beginning in 2027.',
    ),
  },
  {
    slug: 'artec-3d-releases-twins-for-billion-point-environments',
    title: 'Artec 3D releases Twins for billion-point environments',
    excerpt: 'Artec 3D has launched Artec Twins, a software platform designed for very large scanned environments.',
    category: 'digital-twins-bim',
    kind: 'news',
    date: '2026-10-09T08:00:00Z',
    image: 'pointcloud-1',
    tags: ['digital twin', 'point clouds', 'Artec 3D'],
    body: p(
      'Artec 3D has launched Artec Twins, a software platform designed to handle very large environments captured as point clouds with billions of points.',
    ),
  },
  {
    slug: 'vexcel-brings-natural-language-3d-imagery-search-to-gis-workflows',
    title: 'Vexcel brings natural language 3D imagery search to GIS workflows',
    excerpt: 'Vexcel has introduced natural language search to its Platform API, enabling users to identify objects and features across its imagery coverage in 47 countries.',
    category: 'geoai',
    kind: 'news',
    date: '2026-10-08T08:00:00Z',
    image: 'city-1',
    tags: ['GeoAI', 'aerial imagery', 'QGIS'],
    body: p(
      'Vexcel has added natural language search to its Platform API, covering its imagery in 47 countries.',
      'The search combines oblique imagery with AI, so it can find features such as rooflines and window layouts that top-down views miss. Results are returned as structured geographic data rather than just pictures.',
      '## From prompt to map',
      'Steve Lombardi of the Vexcel Data Program demonstrated the approach with an experimental QGIS plugin developed with Claude, and plans to publish its code in a follow-up.',
    ),
  },
  {
    slug: 'topcon-unveils-geomatics-workflow-updates-at-intergeo',
    title: 'Topcon unveils geomatics workflow updates at INTERGEO',
    excerpt: 'Topcon introduced several reality-capture products at INTERGEO 2026 in Munich, including the Origo positioning system and the CR-M2 mobile mapping system.',
    category: 'surveying-reality-capture',
    kind: 'news',
    date: '2026-09-14T08:00:00Z',
    image: 'satellite-3',
    tags: ['Topcon', 'INTERGEO', 'mobile mapping'],
    body: p(
      'Topcon presented a set of geomatics workflow updates at INTERGEO 2026 in Munich.',
      'The announcements include the Topcon Origo positioning system and the CR-M2 mobile mapping system, alongside other reality-capture products.',
    ),
  },
  {
    slug: 'faro-insight-unveils-focus-i-1-scanners-and-rovi-i-1',
    title: 'FARO INSIGHT unveils Focus i.1 scanners and Rovi i.1',
    excerpt: 'FARO INSIGHT has introduced two new terrestrial laser scanners, the Focus i.1 and Focus i.1 X, together with the Rovi i.1 reality capture package.',
    category: 'lidar-3d-scanning',
    kind: 'news',
    date: '2026-09-15T08:00:00Z',
    image: 'pointcloud-1',
    tags: ['FARO', 'terrestrial laser scanning'],
    body: p(
      'FARO INSIGHT introduced the Focus i.1 and Focus i.1 X terrestrial laser scanners on 15 September 2026, along with the Rovi i.1 reality capture package.',
      'The Focus i.1 X is aimed at outdoor work, with a GNSS/RTK receiver and a 400-metre scanning range. Object accuracy is listed at up to 0.9 mm. Advanced processing in the SCENE software moves to a subscription model.',
    ),
  },
  {
    slug: 'leica-launches-x-pad-portfolio-and-gs11-antenna',
    title: 'Leica launches X-PAD portfolio and GS11 antenna',
    excerpt: 'Leica Geosystems has launched the X-PAD portfolio and the GS11 GNSS smart antenna, with Hexagon GeoCloud handling field-to-office data exchange.',
    category: 'gnss-positioning',
    kind: 'news',
    date: '2026-09-14T07:00:00Z',
    image: 'topomap-2',
    tags: ['Leica Geosystems', 'GNSS', 'field software'],
    body: p(
      'Leica Geosystems launched the X-PAD portfolio and the GS11 GNSS smart antenna in September 2026.',
      'Hexagon GeoCloud handles field-to-office data exchange, while Hexagon SmartNet provides GNSS positioning services. The portfolio will be available in select countries in 2026, with broader availability planned for 2027.',
    ),
  },
  {
    slug: 'digital-twins-expand-to-rivers-coasts-and-watersheds',
    title: 'Digital twins expand to rivers, coasts and watersheds',
    excerpt: 'Advances in remote sensing and data processing are allowing continuously updated models of rivers, coastlines, wetlands and watersheds.',
    category: 'hydrography',
    kind: 'feature',
    date: '2026-09-14T10:00:00Z',
    image: 'bathymetry-1',
    tags: ['digital twin', 'remote sensing', 'flood risk'],
    body: p(
      'Digital twins are extending from buildings and utilities to natural systems, writes NV5’s Sven Cowan.',
      'Advances in remote sensing and data processing now make it possible to maintain continuously updated models of rivers, coastlines, wetlands and watersheds, rather than one-time snapshots.',
      '## From snapshot to monitoring',
      'The article’s examples include flood risk tied to shifting river channels and the monitoring of shoreline erosion — cases where the value lies in seeing change over time.',
      '> The value lies in seeing change over time, not in a single snapshot.',
    ),
  },
  {
    slug: 'intergeo-2026-where-geodata-ai-and-live-experiences-shape-the-future-of-the-industry',
    title: 'INTERGEO 2026: where geodata, AI and live experiences shape the future of the industry',
    excerpt: 'INTERGEO 2026 runs from 15 to 17 September in Munich, with digital twins, AI, reality capture and intelligent data rooms in focus.',
    category: 'business-industry',
    kind: 'feature',
    date: '2026-09-10T08:00:00Z',
    image: 'nightlights-1',
    tags: ['INTERGEO', 'events', 'GeoAI'],
    body: p(
      'INTERGEO 2026 takes place from 15 to 17 September in Munich.',
      'The programme focuses on digital twins, AI, reality capturing and intelligent data rooms, alongside Earth observation and BIM. Esri is a Platinum Sponsor, and Jack Dangermond is scheduled to give a keynote.',
    ),
  },
  {
    slug: 'geo-sessions-to-focus-on-operational-geoai',
    title: 'Geo Sessions to focus on operational GeoAI',
    excerpt: 'For the first time, NV5’s virtual Geo Sessions event includes a dedicated GeoAI track on moving AI from experimentation into operational use.',
    category: 'geoai',
    kind: 'news',
    date: '2026-09-16T08:00:00Z',
    image: 'ndvi-1',
    tags: ['GeoAI', 'events', 'NV5'],
    body: p(
      'NV5’s virtual event Geo Sessions will include a dedicated GeoAI track for the first time.',
      'The track examines how organisations can move AI from experimentation into operational use. Other tracks cover SAR, spectral data and lidar.',
    ),
  },
  {
    slug: 'esri-adds-airbus-imagery-to-world-imagery-basemap',
    title: 'Esri to add Airbus 30 cm imagery to its World Imagery basemap',
    excerpt: 'Esri announced at its 2026 User Conference that it will add high-resolution Airbus imagery for about 2,000 cities to its World Imagery basemap.',
    category: 'gis-mapping',
    kind: 'news',
    date: '2026-07-14T08:00:00Z', // ≈ Esri UC week
    image: 'satellite-2',
    tags: ['Esri', 'Airbus', 'basemaps'],
    body: p(
      'Esri announced at the 2026 User Conference that it will add high-resolution Airbus imagery to its World Imagery basemap.',
      'The update covers about 2,000 cities at 30 cm resolution.',
    ),
  },
  {
    slug: 'pwc-elevated-to-esri-platinum-systems-integrator',
    title: 'PwC elevated to Esri Platinum systems integrator',
    excerpt: 'Esri has designated PwC as a Platinum-tier systems integrator within its partner network, with a focus on AI-enabled geospatial work on ArcGIS.',
    category: 'gis-mapping',
    kind: 'news',
    date: '2026-09-29T08:00:00Z', // ≈
    image: 'topomap-1',
    tags: ['Esri', 'ArcGIS', 'partners'],
    body: p('Esri has designated PwC as a Platinum-tier systems integrator within its partner network. The alliance targets AI-enabled geospatial work on ArcGIS.'),
  },
  {
    slug: 'ordnance-survey-renews-ogc-strategic-membership',
    title: 'Ordnance Survey renews OGC Strategic Membership',
    excerpt: 'Great Britain’s national mapping service has renewed its Strategic Membership of the Open Geospatial Consortium.',
    category: 'gis-mapping',
    kind: 'news',
    date: '2026-09-22T08:00:00Z', // ≈
    image: 'topomap-2',
    tags: ['OGC', 'standards', 'national mapping'],
    body: p('Ordnance Survey, Great Britain’s national mapping service, has renewed its Strategic Membership of the Open Geospatial Consortium (OGC), continuing its role in the development of open geospatial standards.'),
  },
  {
    slug: 'thinkwheres-groundmapper-underpins-gis-transformation-at-tilhill',
    title: 'thinkWhere’s groundMapper underpins GIS transformation at Tilhill',
    excerpt: 'Forestry company Tilhill is modernising its GIS with thinkWhere’s groundMapper, QGIS for advanced users and QField for mobile data collection.',
    category: 'gis-mapping',
    kind: 'feature',
    date: '2026-09-25T08:00:00Z', // ≈
    image: 'satellite-1',
    tags: ['QGIS', 'forestry', 'open source'],
    body: p(
      'Tilhill is basing its GIS transformation on thinkWhere’s groundMapper platform.',
      'The company will also draw on thinkWhere’s experience in open source to implement QGIS for advanced users and QField for mobile data collection.',
    ),
  },
  {
    slug: '22983-2',
    title: 'Trimble enables first centimeter-accurate 3D model of Puncak Jaya glaciers',
    excerpt: 'Project Pressure used Trimble GNSS equipment and drone photogrammetry to build a centimeter-accurate 3D model of the receding glaciers in Papua, Indonesia.',
    category: 'surveying-reality-capture',
    kind: 'feature',
    date: '2026-08-20T08:00:00Z', // ≈
    image: 'glacier-1',
    tags: ['glaciers', 'photogrammetry', 'climate'],
    body: p(
      'Project Pressure used Trimble positioning technology and drone-based photogrammetry to build a centimeter-accurate 3D model of the Puncak Jaya glaciers.',
      'Because cloud cover and rain often make satellite imagery unusable in the area, the team placed ground reference points on the glacier, georeferenced with the Trimble Catalyst DA2 GNSS system.',
      '## A baseline for change',
      'The model is intended as a baseline for measuring the glaciers’ recession.',
      '> A centimeter-accurate baseline turns a disappearing glacier into measurable data.',
    ),
  },
  {
    slug: 'lidar-and-mobile-mapping-streamline-railway-corridor-surveys',
    title: 'LiDAR and mobile mapping streamline railway corridor surveys',
    excerpt: 'A railway corridor project combined mobile mapping with GNSS RTK rovers that achieved approximately ±2–3 cm accuracy.',
    category: 'surveying-reality-capture',
    kind: 'feature',
    date: '2026-08-05T08:00:00Z', // ≈
    image: 'satellite-3',
    tags: ['rail', 'mobile mapping', 'GNSS'],
    body: p('A railway corridor survey combined LiDAR mobile mapping with Hexagon GNSS RTK rovers, which achieved approximately ±2–3 cm accuracy.'),
  },
  {
    slug: 'trimble-unveils-maxwell-8-gnss-receiver-lineup',
    title: 'Trimble unveils Maxwell 8 GNSS receiver lineup',
    excerpt: 'Trimble has launched four GNSS receiver modules built on Maxwell 8 technology for OEM integrators in geospatial, marine, construction and mining.',
    category: 'gnss-positioning',
    kind: 'news',
    date: '2026-06-10T08:00:00Z', // ≈
    image: 'earth-2',
    tags: ['Trimble', 'GNSS', 'OEM'],
    body: p(
      'Trimble has launched four GNSS receiver modules — BD1090, BD1092, BD1092i and BX1092i — built on its Maxwell 8 technology.',
      'The modules are aimed at OEM integrators in geospatial, marine, construction and mining, and increase channel capacity for all-in-view tracking. Trimble says this improves positioning accuracy, signal availability and data integrity.',
    ),
  },
  {
    slug: 'riegl-and-diamond-integrate-lidar-into-da62-mpp',
    title: 'RIEGL and Diamond integrate LiDAR into DA62 MPP',
    excerpt: 'RIEGL has integrated its airborne LiDAR and multi-sensor systems into Diamond Aircraft’s DA62 MPP SurveyStar.',
    category: 'lidar-3d-scanning',
    kind: 'news',
    date: '2026-05-20T08:00:00Z', // ≈
    image: 'relief-2',
    tags: ['RIEGL', 'airborne LiDAR', 'aircraft'],
    body: p('RIEGL has integrated its airborne LiDAR and multi-sensor systems into Diamond Aircraft’s DA62 MPP SurveyStar. The airframe takes medium-sized scanners in its nose, while a 20-inch fuselage opening fits larger systems.'),
  },
  {
    slug: 'artec-3d-launches-artec-jet-a-survey-grade-mobile-lidar-scanner',
    title: 'Artec 3D launches Artec Jet, a survey-grade mobile LiDAR scanner',
    excerpt: 'Artec Jet can be carried by hand, mounted on a drone or used from a vehicle.',
    category: 'lidar-3d-scanning',
    kind: 'news',
    date: '2026-04-03T08:00:00Z',
    image: 'pointcloud-3',
    tags: ['Artec 3D', 'mobile LiDAR'],
    body: p('Artec 3D has launched Artec Jet, a survey-grade mobile LiDAR scanner that can be carried by hand, mounted on a drone or used from a vehicle.'),
  },
  {
    slug: 'phase-one-introduces-ix-process',
    title: 'Phase One introduces iX Process',
    excerpt: 'Phase One has released software that handles aerial imagery from capture through photogrammetry, moving to a subscription licensing model.',
    category: 'geospatial-technology',
    kind: 'news',
    date: '2026-04-28T08:00:00Z', // ≈
    image: 'satellite-1',
    tags: ['Phase One', 'photogrammetry', 'software'],
    body: p('Phase One has introduced iX Process, software for its aerial camera systems that handles imagery from capture through photogrammetric processing. It moves to a subscription licensing model.'),
  },
  {
    slug: 'emesent-gx1',
    title: 'Emesent launches all-in-one SLAM LiDAR, RTK and 360° imagery scanner',
    excerpt: 'Emesent describes the GX1 as an integrated SLAM and RTK scanner with 5–10 mm global accuracy.',
    category: 'lidar-3d-scanning',
    kind: 'news',
    date: '2026-02-17T08:00:00Z', // ≈
    image: 'pointcloud-2',
    tags: ['Emesent', 'SLAM', 'RTK'],
    body: p('Emesent has launched the GX1, which it describes as an integrated Simultaneous Localization and Mapping (SLAM) and Real-Time Kinematic (RTK) scanner with 360° imagery. The company reports 5–10 mm global accuracy.'),
  },
  {
    slug: 'nv5-launches-geoagent',
    title: 'NV5 launches GeoAgent, ushering in the era of autonomous geospatial intelligence',
    excerpt: 'NV5 has launched GeoAgent, an agentic AI platform that finds and analyses geospatial data from natural-language commands.',
    category: 'geoai',
    kind: 'news',
    date: '2026-02-04T08:00:00Z', // ≈
    image: 'insar-1',
    tags: ['GeoAI', 'agents', 'NV5'],
    body: p('NV5 has launched GeoAgent, an agentic AI platform that finds and analyses geospatial data in response to natural-language commands.'),
  },
  {
    slug: 'aerial-surveys-international-to-unveil-trinitygeo-at-geo-week-2026',
    title: 'Aerial Surveys International to unveil TrinityGeo at Geo Week 2026',
    excerpt: 'Aerial Surveys International, with Polygon Solutions and Urban Hawk, presents TrinityGeo, a 3D infrastructure monitoring product.',
    category: 'digital-twins-bim',
    kind: 'news',
    date: '2026-02-09T08:00:00Z', // ≈
    image: 'city-2',
    tags: ['Geo Week', 'infrastructure', 'oblique imagery'],
    body: p('Aerial Surveys International, together with Polygon Solutions and Urban Hawk, is presenting TrinityGeo at Geo Week 2026. The 3D infrastructure monitoring product uses high-resolution airborne LiDAR and oblique imagery as its geospatial base.'),
  },
  {
    slug: 'esri-and-pix4d',
    title: 'Esri and Pix4D launch real-time terrestrial mapping workflow',
    excerpt: 'Esri and Pix4D have launched a workflow for real-time terrestrial mapping.',
    category: 'geospatial-technology',
    kind: 'news',
    date: '2026-03-10T08:00:00Z', // ≈
    image: 'city-1',
    tags: ['Esri', 'Pix4D', 'reality capture'],
    body: p('Esri and Pix4D have launched a real-time terrestrial mapping workflow.'),
  },
];

/**
 * Recurring industry events. Dates are deliberately not filled in for the
 * preview: editors add confirmed dates in WordPress (Events → Add new).
 */
export const previewEvents: EventItem[] = [
  { id: 'geo-week', title: 'Geo Week', startDate: null, endDate: null, dateNote: 'Annual · typically February', city: '', country: 'USA', online: false, url: 'https://www.geo-week.com', description: 'Conference and exhibition on the convergence of geospatial technology and the built world: lidar, reality capture, AEC and digital twins.', kind: 'Conference', topics: ['LiDAR', 'AEC', 'Reality capture'] },
  { id: 'geo-business', title: 'GEO Business', startDate: null, endDate: null, dateNote: 'Annual · typically late spring', city: 'London', country: 'UK', online: false, url: 'https://www.geobusinessshow.com', description: 'UK geospatial event combining an exhibition, workshops and a conference programme for the whole geospatial community.', kind: 'Expo', topics: ['Surveying', 'GIS'] },
  { id: 'fig-working-week', title: 'FIG Working Week', startDate: null, endDate: null, dateNote: 'Annual · typically spring', city: 'Varies', country: '', online: false, url: 'https://www.fig.net', description: 'The International Federation of Surveyors’ annual gathering of national associations, academics and practitioners.', kind: 'Conference', topics: ['Surveying', 'Land administration'] },
  { id: 'esri-uc', title: 'Esri User Conference', startDate: null, endDate: null, dateNote: 'Annual · typically July', city: 'San Diego', country: 'USA', online: false, url: 'https://www.esri.com/en-us/about/events/uc/overview', description: 'Large GIS user gathering with technical sessions, plenaries and an exhibition.', kind: 'Conference', topics: ['GIS'] },
  { id: 'commercial-uav-expo', title: 'Commercial UAV Expo', startDate: null, endDate: null, dateNote: 'Annual · typically September', city: 'Las Vegas', country: 'USA', online: false, url: 'https://www.expouav.com', description: 'Trade show and conference on commercial drone operations, including surveying, mapping and inspection.', kind: 'Expo', topics: ['UAV', 'Mapping'] },
  { id: 'intergeo', title: 'INTERGEO', startDate: null, endDate: null, dateNote: 'Annual · typically autumn', city: '', country: 'Germany', online: false, url: 'https://www.intergeo.de', description: 'Conference and trade fair for geodesy, geoinformation and land management.', kind: 'Expo', topics: ['Geodesy', 'GIS', 'Surveying'] },
  { id: 'foss4g', title: 'FOSS4G', startDate: null, endDate: null, dateNote: 'Annual', city: 'Varies', country: '', online: false, url: 'https://foss4g.org', description: 'Global conference for free and open-source software for geospatial, organised by OSGeo.', kind: 'Conference', topics: ['Open source', 'GIS'] },
  { id: 'hydro', title: 'Hydro Conference', startDate: null, endDate: null, dateNote: 'Annual · typically autumn', city: 'Varies', country: '', online: false, url: 'https://www.hydrographicsociety.org', description: 'Hydrographic surveying conference organised under the umbrella of the International Federation of Hydrographic Societies.', kind: 'Conference', topics: ['Hydrography'] },
];

/** Industry organisations. Factual descriptions; editors maintain the list in WordPress. */
export const previewOrganizations: Organization[] = [
  { id: 'fig', name: 'International Federation of Surveyors', abbr: 'FIG', url: 'https://www.fig.net', scope: 'Global', focus: ['Surveying', 'Land administration'], description: 'Federation of national associations representing surveyors worldwide, covering the full range of surveying disciplines.' },
  { id: 'isprs', name: 'International Society for Photogrammetry and Remote Sensing', abbr: 'ISPRS', url: 'https://www.isprs.org', scope: 'Global', focus: ['Photogrammetry', 'Remote sensing'], description: 'Non-governmental organisation advancing international cooperation in photogrammetry, remote sensing and spatial information sciences.' },
  { id: 'ogc', name: 'Open Geospatial Consortium', abbr: 'OGC', url: 'https://www.ogc.org', scope: 'Global', focus: ['Standards', 'Interoperability'], description: 'Member-driven consortium that develops open standards for geospatial content and location-based services.' },
  { id: 'iho', name: 'International Hydrographic Organization', abbr: 'IHO', url: 'https://iho.int', scope: 'Global', focus: ['Hydrography', 'Nautical charting'], description: 'Intergovernmental organisation coordinating hydrographic activities and standards for safe navigation.' },
  { id: 'unggim', name: 'UN Committee of Experts on Global Geospatial Information Management', abbr: 'UN-GGIM', url: 'https://ggim.un.org', scope: 'Global', focus: ['Policy', 'Geospatial information'], description: 'United Nations body setting the agenda for the development and use of global geospatial information.' },
  { id: 'iag', name: 'International Association of Geodesy', abbr: 'IAG', url: 'https://www.iag-aig.org', scope: 'Global', focus: ['Geodesy', 'Reference frames'], description: 'Scientific organisation promoting research and cooperation in geodesy, including global reference frames.' },
  { id: 'osgeo', name: 'Open Source Geospatial Foundation', abbr: 'OSGeo', url: 'https://www.osgeo.org', scope: 'Global', focus: ['Open source', 'Software'], description: 'Foundation supporting the collaborative development of open-source geospatial software and its community.' },
  { id: 'ica', name: 'International Cartographic Association', abbr: 'ICA', url: 'https://icaci.org', scope: 'Global', focus: ['Cartography', 'GIScience'], description: 'Organisation promoting cartography and GIScience through research, education and international collaboration.' },
  { id: 'eurogeographics', name: 'EuroGeographics', abbr: 'EG', url: 'https://eurogeographics.org', scope: 'Europe', focus: ['National mapping', 'Cadastre'], description: 'Association of European national mapping, cadastre and land registry authorities.' },
  { id: 'earsc', name: 'European Association of Remote Sensing Companies', abbr: 'EARSC', url: 'https://earsc.org', scope: 'Europe', focus: ['Earth observation', 'Industry'], description: 'Association representing European companies providing Earth observation-based geo-information services.' },
  { id: 'eurosdr', name: 'European Spatial Data Research', abbr: 'EuroSDR', url: 'https://www.eurosdr.net', scope: 'Europe', focus: ['Research', 'National mapping'], description: 'Network linking national mapping agencies with research institutes to address spatial data challenges.' },
  { id: 'clge', name: 'Council of European Geodetic Surveyors', abbr: 'CLGE', url: 'https://www.clge.eu', scope: 'Europe', focus: ['Surveying', 'Profession'], description: 'Body representing the geodetic surveying profession in Europe.' },
  { id: 'asprs', name: 'American Society for Photogrammetry and Remote Sensing', abbr: 'ASPRS', url: 'https://www.asprs.org', scope: 'Americas', focus: ['Photogrammetry', 'LiDAR', 'Remote sensing'], description: 'Scientific association advancing imaging and geospatial information science and technology.' },
  { id: 'nsps', name: 'National Society of Professional Surveyors', abbr: 'NSPS', url: 'https://www.nsps.us.com', scope: 'Americas', focus: ['Surveying', 'Profession'], description: 'National organisation representing the surveying profession in the United States.' },
  { id: 'urisa', name: 'URISA', abbr: 'URISA', url: 'https://www.urisa.org', scope: 'Americas', focus: ['GIS', 'Public sector'], description: 'Association for GIS professionals, with a focus on the use of spatial technology in government.' },
  { id: 'ssi', name: 'Surveying and Spatial Sciences Institute', abbr: 'SSSI', url: 'https://www.sssi.org.au', scope: 'Asia-Pacific', focus: ['Surveying', 'Spatial sciences'], description: 'Peak body for surveying and spatial science professionals in Australia.' },
];
