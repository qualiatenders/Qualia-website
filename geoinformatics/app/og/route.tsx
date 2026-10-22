import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { categoryBySlug } from '@/lib/taxonomy';
import { LOGO_PATHS } from '@/lib/brand-paths';

const logoSrc = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="16 7 553 114"><path fill="#BBBEC1" d="${LOGO_PATHS.grey}"/><path fill="#D71920" d="${LOGO_PATHS.red}"/><path fill="#FFFFFF" d="${LOGO_PATHS.word}"/></svg>`).toString('base64')}`;

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={291} height={60} alt="" />
          {cat && <div style={{ marginLeft: 'auto', fontSize: 24, color: '#FF4A52', letterSpacing: 3 }}>{cat.name.toUpperCase()}</div>}
        </div>
        <div style={{ fontSize: title.length > 90 ? 52 : 66, lineHeight: 1.04, letterSpacing: -2.5, maxWidth: 1050 }}>{title}</div>
        <div style={{ height: 6, width: 120, background: '#D71920' }} />
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: 'SG', data: font, weight: 600 }], headers: { 'cache-control': 'public, max-age=86400, immutable' } },
  );
}
