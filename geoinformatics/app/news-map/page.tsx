import type { Metadata } from 'next';
import Link from 'next/link';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { NewsGlobe } from '@/components/home/NewsGlobe';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NewsletterBand } from '@/components/home/NewsletterBand';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Live news map',
  description: 'Every recent GeoInformatics story pinned to the place it happens. Spin the globe and dive into the geospatial industry, region by region.',
  path: '/news-map/',
});

export default async function NewsMapPage() {
  const latest = await content.list({ perPage: 60 });
  const located = latest.items.filter((a) => a.location);
  return (
    <>
      <div className="bg-ink pt-8">
        <div className="shell">
          <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'News map', path: '/news-map/' }]} />
        </div>
      </div>
      <NewsGlobe articles={latest.items} />
      <section className="surface-paper py-12 lg:py-16">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="font-sans text-2xl font-extrabold uppercase">By region</h2>
            <p className="mt-2">{located.length} located stories. Not every story has a place: browse everything on the newswire.</p>
            <Link href="/latest/" className="btn btn-dark mt-6">
              Open the full newswire →
            </Link>
          </div>
          <div className="lg:col-span-4">
            <AdSlot placement="sidebar-rectangle" />
          </div>
        </div>
      </section>
      <NewsletterBand source="news-map" />
    </>
  );
}
