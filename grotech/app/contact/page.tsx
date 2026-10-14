import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { ContactForm } from '@/components/forms/ContactForm';
import { Icon } from '@/components/Icon';
import { site, hasAddress, phoneHref } from '@/lib/site';
import { href, quoteHref } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Neem contact op met GROTECH voor vragen over CNC-werk, plaatbewerking, laswerk of een lopende aanvraag. Persoonlijk en in het Nederlands.',
  path: href('contact'),
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Home', path: '/' }, { name: 'Contact', path: href('contact') }]}
        eyebrow="Contact"
        title={<>Eén aanspreekpunt<span className="text-red">.</span></>}
        lead="Een vraag over een onderdeel, een materiaal of een lopende aanvraag? Stuur ons een bericht. We reageren persoonlijk en in het Nederlands."
      />
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <h2 className="mb-8 text-[length:var(--text-h3)] text-offwhite">Stuur een bericht</h2>
            <ContactForm />
          </div>
          <aside className="space-y-6 lg:col-span-5" data-reveal style={{ '--reveal-delay': 120 } as React.CSSProperties}>
            <Link href={quoteHref()} className="group block rounded-md border border-red/40 bg-red/[0.05] p-7 transition-colors hover:border-red md:p-8">
              <span className="grid size-11 place-items-center rounded-[3px] bg-red text-black"><Icon name="upload" size={20} strokeWidth={2} /></span>
              <h2 className="mt-6 text-xl font-black text-offwhite">Heb je een tekening?</h2>
              <p className="mt-2 text-[0.9375rem] text-mist">Gebruik het offerteformulier. Daar kun je bestanden veilig uploaden en direct materiaal, aantal en leverdatum opgeven.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-offwhite uppercase">
                Offerte aanvragen <Icon name="arrow-right" size={16} className="text-red transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            {(site.email || site.phone || hasAddress()) && (
              <div className="rounded-md border border-line bg-charcoal/50 p-7 md:p-8">
                <h2 className="label-caps text-muted">Direct contact</h2>
                <ul className="mt-6 space-y-4">
                  {site.email && <li><a href={`mailto:${site.email}`} className="flex items-center gap-4 text-lg font-bold text-offwhite hover:text-white"><Icon name="mail" size={22} className="text-red" />{site.email}</a></li>}
                  {site.phone && <li><a href={phoneHref(site.phone)} className="flex items-center gap-4 text-lg font-bold text-offwhite hover:text-white"><Icon name="phone" size={22} className="text-red" />{site.phone}</a></li>}
                  {hasAddress() && <li className="flex gap-4 text-mist"><Icon name="pin" size={22} className="shrink-0 text-red" /><span>{site.address.street}<br />{site.address.postalCode} {site.address.city}</span></li>}
                </ul>
                {(site.kvk || site.vat) && <p className="mt-6 border-t border-line pt-5 text-sm text-muted">{site.kvk && <>KvK {site.kvk}</>}{site.kvk && site.vat && ' · '}{site.vat && <>Btw {site.vat}</>}</p>}
              </div>
            )}
            <div className="flex gap-3 rounded-md border border-line p-6 text-[0.9375rem] text-mist">
              <Icon name="lock" size={20} className="mt-0.5 shrink-0 text-red" />
              <p>Stuur via het contactformulier geen vertrouwelijke tekeningen mee. Gebruik daarvoor het beveiligde uploadformulier bij de offerteaanvraag.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
