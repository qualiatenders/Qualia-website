'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { initGeoFx } from '@/lib/geo-fx';

/** Mounts the geo interaction layer (globe, GIS cursor, tiles, coordinates, contours) on every page. */
export function GeoFx() {
  const pathname = usePathname();
  useEffect(() => initGeoFx(), [pathname]);
  return null;
}
