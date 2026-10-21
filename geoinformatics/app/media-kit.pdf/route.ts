import { buildMediaKit } from '@/lib/media-kit';

export const revalidate = 3600;

export async function GET() {
  const pdf = await buildMediaKit();
  return new Response(Buffer.from(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="geoinformatics-media-kit-${new Date().getFullYear()}.pdf"`,
      'cache-control': 'public, s-maxage=3600',
    },
  });
}
