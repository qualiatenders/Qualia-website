import { ContactForm } from '@/components/ContactForm';
import { Media } from '@/components/Media';
import { PageHero } from '@/components/PageHero';
import { Heading, NextLinks, Section } from '@/components/Prose';
import { Reveal } from '@/components/Reveal';
import { GALLERY } from '@/lib/content';
import { P_CONTACT as P } from '@/lib/pages';
import { breadcrumbSchema, jsonLd, pageMetadata } from '@/lib/seo';
import { COMPANY, MAPS_URL, WHATSAPP_URL } from '@/lib/site';

export const metadata = pageMetadata({
  route: 'contact',
  title: 'Contact — kom langs in Zwartsluis',
  ogTitle: 'Contact — Assault Boats, Zwartsluis',
  description:
    'Kom de Assault 500 in het echt bekijken aan Dingstede 6 in Zwartsluis. Bel 06 55 32 43 50, mail info@assaultboats.nl of stuur een bericht.',
});

const kruimels = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact/' },
];

const GEGEVENS = [
  { label: 'Telefoon', value: COMPANY.phoneDisplay, href: `tel:${COMPANY.phoneE164}` },
  { label: 'E-mail', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { label: 'WhatsApp', value: 'Stuur een bericht', href: WHATSAPP_URL, extern: true },
  { label: 'Werkplaats', value: `${COMPANY.street}, ${COMPANY.city}`, href: MAPS_URL, extern: true },
  { label: 'Openingstijden', value: COMPANY.openingHours, href: null },
];

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(kruimels))} />

      <PageHero eyebrow={P.eyebrow} title={P.title} lead={P.lead} crumbs={kruimels} />

      <Section>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Heading lead={P.formulier.lead}>{P.formulier.title}</Heading>
            <ContactForm />
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <span className="type-label text-deck">Direct contact</span>
            </Reveal>
            <dl className="mt-7 border-t border-black/15">
              {GEGEVENS.map((item, i) => (
                <Reveal key={item.label} delay={0.05 + i * 0.05} className="border-b border-black/15 py-5">
                  <dt className="type-label text-mill">{item.label}</dt>
                  <dd className="mt-2">
                    {item.href ? (
                      <a
                        href={item.href}
                        {...(item.extern ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                        className="inline-block py-0.5 font-[family-name:var(--font-display)] text-[1.125rem] font-bold tracking-[-0.02em] text-hull transition-colors hover:text-red lg:text-[1.375rem]"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="font-[family-name:var(--font-display)] text-[1.125rem] font-bold tracking-[-0.02em] text-hull lg:text-[1.375rem]">
                        {item.value}
                      </span>
                    )}
                  </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={0.3} className="mt-10">
              <Media media={GALLERY[7]} sizes="(max-width: 1024px) 100vw, 40vw" className="w-full" />
              <p className="type-label mt-4 text-deck">De werkplaats in Zwartsluis</p>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <Heading tone="dark">Eerst verder kijken</Heading>
        <NextLinks
          tone="dark"
          items={[
            { label: 'Assault 500', description: 'De open uitvoering, vrij in te richten.', href: '/assault-500/' },
            { label: 'Assault 500 Fish', description: 'Vast werpdek met drie afsluitbare bakken.', href: '/assault-500-fish/' },
          ]}
        />
      </Section>
    </>
  );
}
