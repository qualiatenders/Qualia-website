import type { Article, ArticleKind, ArticleList, Author, BreakingItem, Category, EventItem, Organization } from '@/lib/types';

export type ListQuery = {
  page?: number;
  perPage?: number;
  category?: string;
  kinds?: ArticleKind[];
  exclude?: string[];
  tag?: string;
  author?: string;
};

export type PathEntry = { path: string; updatedAt: string; publishedAt: string; title: string; sponsored: boolean };

/** Everything the frontend reads. Implemented by WordPress and by the preview dataset. */
export interface ContentSource {
  mode: 'wordpress' | 'preview';
  list(q: ListQuery): Promise<ArticleList>;
  featured(): Promise<Article[]>;
  breaking(): Promise<BreakingItem[]>;
  mostRead(limit?: number): Promise<Article[]>;
  byPath(path: string): Promise<Article | null>;
  related(article: Article, limit?: number): Promise<Article[]>;
  search(q: string, opts: ListQuery): Promise<ArticleList>;
  events(): Promise<EventItem[]>;
  organizations(): Promise<Organization[]>;
  allPaths(): Promise<PathEntry[]>;
  categories(): Promise<Category[]>;
  tag(slug: string): Promise<{ slug: string; name: string } | null>;
  author(slug: string): Promise<Author | null>;
}
