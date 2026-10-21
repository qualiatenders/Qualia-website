'use client';

import { useEffect } from 'react';

/**
 * Counts one anonymous page view for the "Most read" ranking. Fires after
 * the reader has stayed 5 seconds, so bounces and prefetches don't count.
 * No cookies, no identifiers.
 */
export function ViewBeacon({ id }: { id: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      const body = JSON.stringify({ id });
      if (!navigator.sendBeacon?.('/api/views/', new Blob([body], { type: 'application/json' })))
        fetch('/api/views/', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
    }, 5000);
    return () => window.clearTimeout(t);
  }, [id]);
  return null;
}
