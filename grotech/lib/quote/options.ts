import type { TechniqueId } from '../content/types';

/**
 * Keuzelijsten voor het offerteformulier. Gedeeld door client en server, zodat
 * de server-side validatie exact dezelfde waarden accepteert als de UI toont.
 */
export const techniques: { id: TechniqueId; label: string; description: string; serviceSlug?: string; image?: string }[] = [
  { id: 'frezen', label: 'CNC-frezen', description: 'Prismatische en complexe precisiedelen', serviceSlug: 'cnc-frezen', image: '/images/renders/housing-800.webp' },
  { id: 'draaien', label: 'CNC-draaien', description: 'Assen, bussen, flenzen en draaidelen', serviceSlug: 'cnc-draaien', image: '/images/renders/shaft-800.webp' },
  { id: 'snijwerk', label: 'Snijwerk', description: 'Plaatdelen volgens DXF of tekening', serviceSlug: 'aluminium-snijwerk', image: '/images/renders/plate-800.webp' },
  { id: 'zetwerk', label: 'Zetwerk', description: 'CNC-kantwerk van plaatdelen', serviceSlug: 'aluminium-zetwerk', image: '/images/renders/bracket-800.webp' },
  { id: 'laswerk', label: 'Laswerk', description: 'TIG, MIG en MAG', serviceSlug: 'laswerk-samenstellingen', image: '/images/renders/frame-800.webp' },
  { id: 'samenstelling', label: 'Complete samenstelling', description: 'Meerdere bewerkingen tot één geheel' },
];

export const techniqueIds = techniques.map((t) => t.id) as [TechniqueId, ...TechniqueId[]];

export const materialOptions = [
  { id: 'aluminium', label: 'Aluminium' },
  { id: 'rvs', label: 'RVS' },
  { id: 'staal', label: 'Staal' },
  { id: 'messing', label: 'Messing' },
  { id: 'koper', label: 'Koper' },
  { id: 'kunststof', label: 'Technische kunststof' },
  { id: 'meerdere', label: 'Meerdere materialen' },
  { id: 'anders', label: 'Anders / weet ik nog niet' },
] as const;
export type MaterialOptionId = (typeof materialOptions)[number]['id'];
export const materialIds = materialOptions.map((m) => m.id) as [MaterialOptionId, ...MaterialOptionId[]];

export const surfaceOptions = [
  { id: 'geen', label: 'Geen / onbehandeld' },
  { id: 'anodiseren', label: 'Anodiseren' },
  { id: 'poedercoaten', label: 'Poedercoaten' },
  { id: 'stralen', label: 'Stralen' },
  { id: 'verzinken', label: 'Verzinken' },
  { id: 'beitsen', label: 'Beitsen en passiveren' },
  { id: 'volgens-tekening', label: 'Volgens tekening' },
  { id: 'advies', label: 'Advies gewenst' },
  { id: 'anders', label: 'Anders' },
] as const;
export type SurfaceOptionId = (typeof surfaceOptions)[number]['id'];
export const surfaceIds = surfaceOptions.map((m) => m.id) as [SurfaceOptionId, ...SurfaceOptionId[]];

/** Uploadlimieten — ook getoond in de UI, dus één bron van waarheid. */
export const uploadLimits = {
  maxFiles: 10,
  maxFileBytes: 25 * 1024 * 1024,
  maxTotalBytes: 100 * 1024 * 1024,
  extensions: ['step', 'stp', 'iges', 'igs', 'dxf', 'dwg', 'pdf', 'zip', 'stl', 'x_t', 'x_b', 'sat', 'png', 'jpg', 'jpeg'] as const,
};

export const acceptAttribute = uploadLimits.extensions.map((e) => `.${e}`).join(',');

export function labelFor<T extends { id: string; label: string }>(list: readonly T[], id: string | undefined | null) {
  return list.find((x) => x.id === id)?.label ?? id ?? '';
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0).replace('.', ',')} MB`;
}
