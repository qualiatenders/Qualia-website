import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { categoryBySlug } from '@/lib/taxonomy';

/** 1200×630 share card: brand frame, desk code, headline. Used when an article has no photo. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const title = (u.searchParams.get('t') || 'GeoInformatics').slice(0, 160);
  const cat = categoryBySlug(u.searchParams.get('c') || '');
  const font = await fs.readFile(path.join(process.cwd(), 'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff'));
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0B0D10', color: '#fff', padding: 72, fontFamily: 'SG', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '96px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 52, height: 52, background: '#D71920', display: 'flex' }} />
          <div style={{ fontSize: 38, letterSpacing: -1.5 }}>GeoInformatics</div>
          {cat && <div style={{ marginLeft: 'auto', fontSize: 24, color: '#FF4A52', letterSpacing: 3 }}>{cat.name.toUpperCase()}</div>}
        </div>
        <div style={{ fontSize: title.length > 90 ? 52 : 66, lineHeight: 1.04, letterSpacing: -2.5, maxWidth: 1050 }}>{title}</div>
        <div style={{ height: 6, width: 120, background: '#D71920' }} />
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: 'SG', data: font, weight: 600 }], headers: { 'cache-control': 'public, max-age=86400, immutable' } },
  );
}
