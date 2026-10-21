import type { Metadata } from 'next';
import Link from 'next/link';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { PageHero } from '@/components/PageHero';
import { EventList, sortEvents } from '@/components/EventList';
import { JsonLd } from '@/components/JsonLd';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: 'Geospatial events calendar',
  description: 'Upcoming conferences, expos and summits across surveying, GIS, Earth observation, LiDAR, hydrography and GeoAI.',
  path: '/events/',
});

export default async function EventsPage() {
  const events = sortEvents(await content.events());
  const dated = events.filter((e) => e.startDate);
  return (
    <>
      <PageHero kicker="Industry calendar" title="Events" intro="Where the geospatial industry meets. Listings are curated by our editors; always confirm details with the organiser." crumbs={[{ name: 'Home', path: '/' }, { name: 'Events', path: '/events/' }]} visual="constellation" />
      <section className="surface-paper py-12 lg:py-16">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">{events.length ? <EventList events={events} /> : <p className="text-fg-muted">No events listed yet.</p>}</div>
          <aside className="space-y-8 lg:col-span-4">
            <div className="surface-dark graticule p-8">
              <p className="kicker text-red-ink">Organisers</p>
              <h2 className="mt-3 font-display text-2xl leading-tight font-semibold">Running a geospatial event?</h2>
              <p className="mt-3 text-fog">Submit it for the calendar, or ask about event promotion across GeoInformatics and the newsletter.</p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/contact/?topic=event" className="btn btn-light">
                  Submit an event
                </Link>
                <Link href="/advertise/#formats" className="btn btn-outline border-white/25">
                  Event promotion
                </Link>
              </div>
            </div>
            <AdSlot placement="sidebar-rectangle" />
          </aside>
        </div>
      </section>
      {dated.length > 0 && (
        <JsonLd
          data={dated.map((e) => ({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: e.title,
            startDate: e.startDate,
            endDate: e.endDate ?? e.startDate,
            eventAttendanceMode: e.online ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
            location: e.online ? { '@type': 'VirtualLocation', url: e.url } : { '@type': 'Place', name: e.city, address: [e.city, e.country].filter(Boolean).join(', ') },
            description: e.description,
            url: e.url,
            organizer: { '@type': 'Organization', name: e.title, url: e.url },
            mainEntityOfPage: absoluteUrl('/events/'),
          }))}
        />
      )}
    </>
  );
}
