import 'server-only';
import { cache } from 'react';
import type { ContentSource } from './source';
import { previewSource } from './preview';
import { wordpressSource } from './wordpress';

/** WordPress when WORDPRESS_URL is set; the labelled preview dataset otherwise. */
export const content: ContentSource = process.env.WORDPRESS_URL ? wordpressSource : previewSource;
export const isPreviewContent = content.mode === 'preview';

/** Per-request memoised lookups shared by generateMetadata and the page. */
export const getArticle = cache((path: string) => content.byPath(path));
