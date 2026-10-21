import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dataDir, isProd, platformSecret, warnOnce, wordpressUrl } from './config';

/**
 * Forwards measured events to the WordPress plugin, which stores them as
 * daily aggregates (wp_gi_ad_stats, wp_gi_post_views). Without WordPress, in
 * development, events go to storage/*.jsonl so the pipeline can be tested.
 */
export async function forward(endpoint: 'track' | 'view', payload: Record<string, string>) {
  const wp = wordpressUrl();
  if (!wp) {
    if (isProd) return;
    const dir = dataDir();
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    await fs.appendFile(path.join(dir, `${endpoint === 'track' ? 'ad-events' : 'views'}.jsonl`), JSON.stringify({ ...payload, at: new Date().toISOString() }) + '\n');
    return;
  }
  const secret = platformSecret();
  if (!secret) {
    warnOnce('platform-secret', 'GI_PLATFORM_SECRET is not set; ad and view events are not recorded.');
    return;
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try {
    await fetch(`${wp}/wp-json/gi/v1/${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-gi-secret': secret },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: 'no-store',
    });
  } catch (e) {
    console.warn('[tracking]', endpoint, e instanceof Error ? e.message : e);
  } finally {
    clearTimeout(t);
  }
}
