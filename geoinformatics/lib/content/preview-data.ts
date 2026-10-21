import type { ArticleKind, EventItem, Organization } from '@/lib/types';

/**
 * PREVIEW CONTENT — used only while WORDPRESS_URL is not set.
 *
 * These are sample explainers written to exercise the layouts with realistic
 * lengths and structure. They make no claims about real companies, products
 * or announcements, and the site shows a "preview content" notice whenever
 * this dataset is active. In production every article comes from WordPress.
 */

export type PreviewArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  kind: ArticleKind;
  hoursAgo: number;
  body: string[];
  featured?: 'lead' | 'secondary';
  breaking?: boolean;
  sponsored?: string;
  tags?: string[];
};

const p = (...paras: string[]) => paras;

export const previewArticles: PreviewArticle[] = [
  {
    slug: 'the-quiet-arms-race-in-satellite-revisit-rates',
    title: 'The quiet arms race in satellite revisit rates is changing what “current” means for a map',
    excerpt:
      'Daily and sub-daily imaging has moved from a premium to an expectation. For agencies and engineers, the question is no longer whether the data exists, but whether their workflows can keep up with it.',
    category: 'earth-observation',
    kind: 'analysis',
    hoursAgo: 2,
    featured: 'lead',
    tags: ['satellite imagery', 'analysis-ready data', 'change detection'],
    body: p(
      'For most of the history of Earth observation, the limiting factor was the satellite. Revisit times were measured in days or weeks, cloud cover erased whole acquisitions, and the base map of a city might be refreshed once a year if the budget allowed it.',
      'That bottleneck has moved. Larger constellations of smaller satellites, combined with radar that sees through cloud and darkness, mean that many places on Earth are now imaged several times a day. The scarce resource is no longer pixels. It is the attention, processing and decision-making capacity on the ground.',
      '## From archive to stream',
      'When imagery arrived in batches, the natural workflow was a project: order a scene, process it, deliver a product. A continuous stream breaks that model. Organisations increasingly treat imagery like telemetry — something to monitor, alert on and summarise, rather than something to open and inspect.',
      '> The scarce resource is no longer pixels. It is the capacity on the ground to act on them.',
      'That shift favours analysis-ready data: imagery that is already radiometrically calibrated, orthorectified and tiled in a consistent grid, so that two acquisitions weeks apart can be compared without a specialist preparing each one by hand.',
      '## What it means for practitioners',
      'For GIS teams the practical consequences are mundane but significant. Storage strategies change when the newest data matters more than the archive. Change-detection thresholds have to be tuned to avoid a flood of false alarms. And procurement moves from buying images to buying access, often by area and time window rather than by scene.',
      'The organisations that benefit most are not necessarily those with the biggest data budgets. They are the ones that have decided, in advance, which changes they actually need to know about — and built the pipeline to tell them.',
    ),
  },
  {
    slug: 'why-point-cloud-compression-is-now-a-budget-question',
    title: 'Why point-cloud compression has become a budget question, not just a technical one',
    excerpt: 'Mobile and airborne scanners produce terabytes per project. How that data is stored, streamed and archived now shapes the cost of every survey.',
    category: 'lidar-3d-scanning',
    kind: 'analysis',
    hoursAgo: 5,
    featured: 'secondary',
    tags: ['point clouds', 'COPC', 'data management'],
    body: p(
      'A single day of mobile mapping can generate more data than an entire municipal GIS held a decade ago. The scanners got faster; the hard drives, networks and cloud bills did not get cheaper at the same rate.',
      '## Formats that stream',
      'Cloud-optimised formats such as COPC organise points so that a viewer can request only the area and level of detail it needs. That turns a multi-gigabyte download into a handful of small requests, and makes it realistic to share project data with clients who will never install desktop software.',
      'The trade-offs are real. Lossless compression preserves every return but saves less space; lossy schemes can discard detail that a later use case turns out to need. Survey teams increasingly document these choices in their delivery specifications, because the decision outlives the project.',
    ),
  },
  {
    slug: 'gnss-interference-what-surveyors-should-log',
    title: 'GNSS interference is no longer an edge case. Here is what field teams should be logging',
    excerpt: 'Jamming and spoofing reports have spread beyond conflict zones. Simple logging practices make it far easier to spot — and prove — degraded positioning.',
    category: 'gnss-positioning',
    kind: 'news',
    hoursAgo: 7,
    featured: 'secondary',
    breaking: true,
    tags: ['GNSS', 'interference', 'resilience'],
    body: p(
      'Interference with satellite navigation signals has become a routine topic in aviation and maritime safety notices. For surveyors, the effects are subtler: fixes that take longer, solutions that float, and coordinates that look plausible but are wrong.',
      '## Log the signal, not just the solution',
      'Most receivers record far more than the final coordinate. Carrier-to-noise ratios, the number of tracked satellites per constellation and automatic gain control values can all indicate interference. Keeping those logs, even when a job seems to go smoothly, gives teams a baseline to compare against when it does not.',
      'Multi-constellation, multi-frequency receivers and independent checks — a control point, a total-station tie-in — remain the most practical defences. None of them is new. What has changed is how often they are needed.',
    ),
  },
  {
    slug: 'digital-twins-need-boring-data-governance',
    title: 'City digital twins succeed or fail on the most boring part: data governance',
    excerpt: 'Impressive 3D visualisations are easy to build. Keeping them accurate, licensed and trusted across departments is where most programmes stall.',
    category: 'digital-twins-bim',
    kind: 'feature',
    hoursAgo: 11,
    tags: ['digital twin', 'governance', 'smart cities'],
    body: p(
      'The first version of a city digital twin is usually a triumph. A photorealistic mesh, a few live sensor feeds and a planning scenario or two make for a compelling demonstration. The second year is harder.',
      '## Who owns the update?',
      'Every layer in a twin has an owner, an update cycle and a licence. When those are undefined, the model drifts out of date and departments quietly return to their own systems. Successful programmes treat the twin as a data product with service levels, not as a one-off visualisation project.',
      '> A digital twin is a promise that the model will keep matching the city. Governance is how that promise is kept.',
      'Open standards for 3D city models and building information help, because they reduce the cost of moving data between systems. But standards cannot decide who is responsible for keeping a road network current. That remains an organisational choice.',
    ),
  },
  {
    slug: 'geoai-foundation-models-explained',
    title: 'Geospatial foundation models, explained without the hype',
    excerpt: 'Large pre-trained models for imagery promise faster mapping with fewer labels. What they are, where they help, and where classical methods still win.',
    category: 'geoai',
    kind: 'analysis',
    hoursAgo: 14,
    tags: ['foundation models', 'machine learning', 'feature extraction'],
    body: p(
      'A foundation model is trained once, on a very large and varied dataset, and then adapted to many specific tasks. In geospatial work, that typically means a model pre-trained on huge volumes of satellite or aerial imagery that can be fine-tuned to detect buildings, classify crops or map flood extents with relatively few labelled examples.',
      '## Where they help',
      'The gains are largest where labels are expensive and conditions vary: new regions, new sensors, rare classes. A model that has already learned what texture, shadow and seasonality look like needs fewer examples to learn what a solar farm looks like.',
      '## Where they do not',
      'For well-defined tasks with plenty of training data and stable inputs, smaller task-specific models remain cheaper to run and easier to validate. And no model removes the need for accuracy assessment against independent reference data — the step that turns a prediction into a map someone can rely on.',
    ),
  },
  {
    slug: 'uncrewed-surface-vessels-change-survey-planning',
    title: 'Uncrewed surface vessels are changing how hydrographic surveys are planned',
    excerpt: 'Smaller, remotely operated platforms shift costs from vessel days to data processing — and open up shallow waters that were awkward to survey before.',
    category: 'hydrography',
    kind: 'feature',
    hoursAgo: 20,
    tags: ['USV', 'multibeam', 'bathymetry'],
    body: p(
      'Traditional hydrographic surveys revolve around the vessel: its day rate, its crew and the weather window in which it can work. Uncrewed surface vessels change that equation, particularly in ports, rivers and nearshore areas.',
      '## A different cost structure',
      'With smaller platforms, the expensive part of a survey moves from time on the water to time at the processing workstation. Planning starts to focus on line spacing, overlap and quality control rather than on minimising days at sea.',
      'Operational questions remain, from regulatory approval to collision avoidance and remote supervision. But for repeat surveys of the same waterway, the ability to deploy quickly and frequently is already changing expectations.',
    ),
  },
  {
    slug: 'cloud-native-geospatial-formats-primer',
    title: 'A practical primer on cloud-native geospatial formats',
    excerpt: 'COG, GeoParquet, Zarr, COPC and PMTiles: what each is for, and how to choose without rewriting your whole stack.',
    category: 'geospatial-technology',
    kind: 'analysis',
    hoursAgo: 26,
    tags: ['cloud-native', 'GeoParquet', 'COG'],
    body: p(
      'Cloud-native formats share one idea: data should be readable in pieces, directly from object storage, without downloading the whole file or running a dedicated server.',
      '## Choosing a format',
      'Cloud Optimized GeoTIFF is the natural choice for single raster layers. Zarr suits multi-dimensional arrays such as climate or time-series data. GeoParquet brings columnar efficiency to vector data. COPC does the same for point clouds, and PMTiles packages map tiles into a single file that a browser can read by range request.',
      'Few organisations need all of them. Starting with the layer that is downloaded most often, and converting it, is usually enough to show whether the approach pays off.',
    ),
  },
  {
    slug: 'reality-capture-for-as-built-verification',
    title: 'Reality capture is becoming the default for as-built verification',
    excerpt: 'Comparing scans against design models is moving from specialist service to standard site practice. The bottleneck is now interpretation, not capture.',
    category: 'surveying-reality-capture',
    kind: 'news',
    hoursAgo: 31,
    tags: ['as-built', 'scan-to-BIM', 'construction'],
    body: p(
      'On large construction projects, laser scanning and photogrammetry are increasingly used to check what has been built against what was designed. Deviations caught early are cheaper to fix than those found during fit-out.',
      'The capture itself has become faster and more automated. The harder step is deciding which deviations matter, communicating them clearly and tracking them to resolution — work that still depends on experienced surveyors and engineers.',
    ),
  },
  {
    slug: 'spatial-data-infrastructure-after-open-data',
    title: 'What comes after open data for national spatial data infrastructures?',
    excerpt: 'Many mapping agencies have opened their core datasets. The next challenge is making them usable, current and connected across borders.',
    category: 'gis-mapping',
    kind: 'analysis',
    hoursAgo: 38,
    tags: ['SDI', 'open data', 'INSPIRE'],
    body: p(
      'Opening authoritative datasets was a milestone. But a download portal is not the same as infrastructure that developers, planners and emergency services can build on every day.',
      '## Usability is the new metric',
      'Modern APIs, consistent identifiers and clear update schedules matter as much as licensing. Agencies are increasingly measuring success by how often their data is used — and by whom — rather than by how much of it is available.',
    ),
  },
  {
    slug: 'consolidation-in-geospatial-software',
    title: 'Consolidation, platforms and niches: reading the geospatial software market',
    excerpt: 'Acquisitions keep reshaping the vendor landscape. For buyers, the practical questions are interoperability and lock-in.',
    category: 'business-industry',
    kind: 'analysis',
    hoursAgo: 46,
    tags: ['market', 'M&A', 'software'],
    body: p(
      'The geospatial software market has long combined a few broad platforms with many specialised tools. Acquisitions tend to fold niche capabilities into larger suites, while new entrants appear around emerging data types and workflows.',
      'For buyers, the most useful questions are practical: can data move in and out using open formats, how are licences priced as usage grows, and what happens to a tool if its vendor changes direction?',
    ),
  },
  {
    slug: 'sar-for-infrastructure-monitoring',
    title: 'Radar interferometry is moving from research to routine infrastructure monitoring',
    excerpt: 'Millimetre-scale ground motion measured from orbit is finding its way into the maintenance plans of road, rail and dam operators.',
    category: 'earth-observation',
    kind: 'news',
    hoursAgo: 52,
    tags: ['SAR', 'InSAR', 'infrastructure'],
    body: p(
      'Interferometric synthetic aperture radar can detect small ground movements over wide areas by comparing repeated radar acquisitions. Once a research technique, it is increasingly offered as a monitoring service for linear infrastructure.',
      'The value lies in screening: identifying the few locations along hundreds of kilometres of track or road that merit a closer look on the ground.',
    ),
  },
  {
    slug: 'airborne-lidar-for-forest-inventory',
    title: 'Airborne LiDAR is redrawing the economics of forest inventory',
    excerpt: 'Canopy height, biomass and structure can now be estimated at stand level across entire regions — with field plots used to calibrate, not to sample everything.',
    category: 'lidar-3d-scanning',
    kind: 'feature',
    hoursAgo: 60,
    tags: ['forestry', 'airborne LiDAR', 'biomass'],
    body: p(
      'Forest inventories have traditionally relied on field plots extrapolated to larger areas. Airborne laser scanning flips that relationship: wall-to-wall structural data, calibrated by a smaller number of carefully measured plots.',
      'The approach is increasingly relevant for carbon accounting, where transparent and repeatable measurement matters as much as precision.',
    ),
  },
  {
    slug: 'interview-the-surveyor-shortage',
    title: '“We are not short of technology. We are short of surveyors.” On the skills gap',
    excerpt: 'Automation keeps expanding what one field team can capture. Educators and employers explain why that makes trained professionals more valuable, not less.',
    category: 'surveying-reality-capture',
    kind: 'interview',
    hoursAgo: 70,
    tags: ['skills', 'education', 'workforce'],
    body: p(
      'Across many countries, professional bodies report that fewer young people are entering surveying than are retiring from it. At the same time, the tools available to each surveyor are more capable than ever.',
      'Educators describe a profession whose core — understanding reference systems, accuracy and legal boundaries — is invisible to outsiders, and whose modern toolset is rarely shown in schools. Making that work visible is, they argue, the first step to closing the gap.',
    ),
  },
  {
    slug: 'geoai-building-footprints-accuracy',
    title: 'Automated building footprints are everywhere. How accurate are they?',
    excerpt: 'Machine-learned building datasets now cover much of the planet. Understanding their error patterns is essential before using them for planning or risk.',
    category: 'geoai',
    kind: 'analysis',
    hoursAgo: 80,
    tags: ['building extraction', 'accuracy', 'open data'],
    body: p(
      'Large building-footprint datasets derived from imagery with machine learning have filled gaps where official mapping is sparse. Their accuracy, however, varies with building density, roof material, image quality and local architecture.',
      'Users should look for published accuracy assessments, test the data against local reference samples and be cautious when combining footprints with population or exposure models.',
    ),
  },
  {
    slug: 'ppp-rtk-corrections-explained',
    title: 'PPP-RTK, explained: precise positioning without a nearby base station',
    excerpt: 'Correction services that combine the strengths of PPP and RTK are expanding. What they offer, and where traditional RTK still makes sense.',
    category: 'gnss-positioning',
    kind: 'analysis',
    hoursAgo: 96,
    tags: ['RTK', 'PPP', 'corrections'],
    body: p(
      'Real-time kinematic positioning delivers centimetre-level results but depends on a nearby reference station or network. Precise point positioning works globally but traditionally needs a long time to converge. PPP-RTK combines regional atmospheric corrections with satellite orbit and clock data to shorten that convergence.',
      'For machine control, agriculture and mass-market devices, the trade-off can be attractive. For legal surveys and control work, many teams still prefer the direct traceability of conventional RTK and static observations.',
    ),
  },
  {
    slug: 'bim-gis-integration-practical',
    title: 'BIM and GIS integration: the practical steps that actually work',
    excerpt: 'Coordinate reference systems, levels of detail and data ownership are where integration projects succeed or stall.',
    category: 'digital-twins-bim',
    kind: 'analysis',
    hoursAgo: 110,
    tags: ['BIM', 'GIS', 'interoperability'],
    body: p(
      'Bringing building models into a geographic context sounds straightforward: place the model on the map. In practice, local engineering coordinates, differing levels of detail and attribute schemas create friction at every step.',
      'Teams that succeed usually agree a project coordinate reference system on day one, define which attributes must survive the transfer, and accept that the GIS view will be a simplified, purpose-built representation of the BIM model.',
    ),
  },
  {
    slug: 'seabed-mapping-gap',
    title: 'Mapping the remaining seabed: progress, gaps and why it matters',
    excerpt: 'Most of the ocean floor is still not mapped at modern resolution. Crowdsourced and autonomous data collection are helping to close the gap.',
    category: 'hydrography',
    kind: 'news',
    hoursAgo: 130,
    tags: ['seabed mapping', 'crowdsourced bathymetry'],
    body: p(
      'High-resolution bathymetry underpins navigation, cable routing, habitat protection and tsunami modelling. International initiatives have made progress, but large areas of the deep ocean remain known only from coarse satellite-derived estimates.',
      'Crowdsourced soundings from ordinary vessels, autonomous platforms and transit mapping by research ships all contribute — provided the data is shared in usable, documented formats.',
    ),
  },
  {
    slug: 'vector-tiles-and-web-maps',
    title: 'How vector tiles quietly became the backbone of the web map',
    excerpt: 'Styling on the client, smaller payloads and smooth zooming made vector tiles the default for interactive maps. The next step is 3D.',
    category: 'geospatial-technology',
    kind: 'feature',
    hoursAgo: 150,
    tags: ['vector tiles', 'web mapping'],
    body: p(
      'Raster tiles made web maps possible; vector tiles made them flexible. By sending geometry and attributes rather than pre-rendered images, they let the browser decide how the map looks — including labels, languages and dark modes.',
      'The same principles are now being applied to 3D content, with streaming formats that let a browser load only the buildings and terrain in view.',
    ),
  },
  {
    slug: 'sponsored-field-to-office-workflows',
    title: 'Field-to-office in one day: streamlining a scanning workflow',
    excerpt: 'A step-by-step look at how a survey team can reduce turnaround between capture and deliverable.',
    category: 'surveying-reality-capture',
    kind: 'feature',
    hoursAgo: 40,
    sponsored: 'Example Partner',
    tags: ['workflow'],
    body: p(
      'This is a placeholder for partner content. Sponsored articles are always labelled, kept out of news sitemaps and separated visually from independent editorial content.',
    ),
  },
  {
    slug: 'geospatial-careers-and-the-climate-economy',
    title: 'The climate economy is becoming one of the biggest employers of geospatial skills',
    excerpt: 'Carbon markets, climate risk and renewable energy siting all depend on location data — and on people who know how to handle it.',
    category: 'business-industry',
    kind: 'opinion',
    hoursAgo: 170,
    tags: ['climate', 'careers'],
    body: p(
      'From measuring forest carbon to siting wind farms and assessing flood exposure for insurers, much of the climate economy is built on spatial analysis. That creates demand for professionals who combine domain knowledge with remote sensing, GIS and data engineering skills.',
    ),
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
