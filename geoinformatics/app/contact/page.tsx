import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import { contactTopics, type ContactTopic } from '@/lib/forms';
import { PageHero } from '@/components/PageHero';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = pageMetadata({ title: 'Contact', description: 'Contact the GeoInformatics newsroom: news tips, press releases, event listings, corrections and advertising.', path: '/contact/' });

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const t = (await searchParams).topic;
  const topic = (t && t in contactTopics ? t : 'editorial') as ContactTopic;
  const channels = [
    { title: 'Newsroom', body: 'News tips, press releases, corrections and event listings.', email: site.email.editorial },
    { title: 'Advertising & partnerships', body: 'Display, sponsored content, newsletter and event partnerships.', email: site.email.advertising, href: '/advertise/' },
  ];
  return (
    <>
      <PageHero kicker="Contact" title="Talk to us" intro="We read every message. Press releases and tips go straight to the editors; commercial questions to our partnerships team." crumbs={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact/' }]} />
      <section className="surface-white py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <aside className="space-y-8 lg:col-span-4">
            {channels.map((c) => (
              <div key={c.title} className="border-t-2 border-ink pt-5">
                <h2 className="font-display text-xl font-semibold">{c.title}</h2>
                <p className="mt-2 text-fg-muted">{c.body}</p>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="mt-3 inline-block font-semibold underline underline-offset-4">
                    {c.email}
                  </a>
                )}
                {c.href && (
                  <a href={c.href} className="mt-3 block text-sm font-semibold underline underline-offset-4">
                    See advertising options →
                  </a>
                )}
              </div>
            ))}
            {site.publisher.address && (
              <address className="border-t-2 border-ink pt-5 text-fg-muted not-italic">
                <span className="font-display block text-xl font-semibold text-ink not-italic">{site.publisher.legalName || site.name}</span>
                <span className="mt-2 block whitespace-pre-line">{site.publisher.address}</span>
              </address>
            )}
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm initialTopic={topic} />
          </div>
        </div>
      </section>
    </>
  );
}
