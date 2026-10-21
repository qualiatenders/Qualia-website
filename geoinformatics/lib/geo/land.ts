import 'server-only';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';

/**
 * World land polygons (Natural Earth 1:110m via world-atlas) as compact
 * rings of [lon, lat] pairs rounded to 0.1°, for the news globe. ~25 KB.
 */
let cache: number[][] | null = null;

export function landRings(): number[][] {
  if (cache) return cache;
  const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
  const fc = feature(topo, topo.objects.land) as unknown as GeoJSON.FeatureCollection<GeoJSON.MultiPolygon | GeoJSON.Polygon>;
  const rings: number[][] = [];
  for (const f of fc.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys)
      for (const ring of poly) {
        const flat: number[] = [];
        let prev = '';
        for (const [lon, lat] of ring) {
          const k = `${lon!.toFixed(1)},${lat!.toFixed(1)}`;
          if (k === prev) continue;
          prev = k;
          flat.push(Math.round(lon! * 10) / 10, Math.round(lat! * 10) / 10);
        }
        if (flat.length >= 8) rings.push(flat);
      }
  }
  cache = rings;
  return rings;
}
