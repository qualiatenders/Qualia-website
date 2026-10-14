import { isAdmin } from '@/lib/server/admin-auth';
import { adminConfig } from '@/lib/server/config';
import { readQuoteFile } from '@/lib/server/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Geauthenticeerde download; bestanden zijn nooit via een publieke URL bereikbaar. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  if (!adminConfig()) return new Response('Not found', { status: 404 });
  if (!(await isAdmin())) return new Response('Unauthorized', { status: 401 });
  const { id, file } = await params;
  let res;
  try {
    res = await readQuoteFile(id, file);
  } catch (e) {
    console.error(`[grotech] bestand lezen mislukt (${id}): ${(e as Error).message}`);
    return new Response('Bestand kon niet worden gelezen.', { status: 500 });
  }
  if (!res) return new Response('Not found', { status: 404 });
  const ascii = res.file.name.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '');
  return new Response(new Uint8Array(res.data), {
    headers: {
      'content-type': 'application/octet-stream',
      'content-disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(res.file.name)}`,
      'content-length': String(res.data.length),
      'cache-control': 'no-store, private',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; sandbox",
    },
  });
}
