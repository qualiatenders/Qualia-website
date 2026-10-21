import { content } from '@/lib/content';
import type { ArticleKind } from '@/lib/types';

const KINDS: ArticleKind[] = ['news', 'analysis', 'interview', 'feature', 'opinion'];

/** Paginated article lists for the client-side feed (filters, load more). */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const int = (k: string, d: number, max: number) => Math.min(max, Math.max(1, Number(u.searchParams.get(k)) || d));
  const category = u.searchParams.get('category')?.slice(0, 80) || undefined;
  const kinds = (u.searchParams.get('kinds') ?? '').split(',').filter((k): k is ArticleKind => KINDS.includes(k as ArticleKind));
  const exclude = (u.searchParams.get('exclude') ?? '').split(',').filter((x) => /^\d+$/.test(x)).slice(0, 50);
  const tag = u.searchParams.get('tag')?.slice(0, 80) || undefined;
  const author = u.searchParams.get('author')?.slice(0, 80) || undefined;
  const r = await content.list({ page: int('page', 1, 500), perPage: int('perPage', 10, 30), category, kinds: kinds.length ? kinds : undefined, exclude, tag, author });
  return Response.json(
    { items: r.items, totalPages: r.totalPages },
    { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  );
}
