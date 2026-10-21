import Link from 'next/link';
import { categories } from '@/lib/taxonomy';
import { site } from '@/lib/site';
import { Logo } from './Logo';
import { NewsletterForm } from './NewsletterForm';
import { BrandIcon } from './Icon';

const platform = [
  { href: '/latest/', label: 'Latest news' },
  { href: '/analysis/', label: 'Intelligence' },
  { href: '/news-map/', label: 'Live news map' },
  { href: '/industries/', label: 'All industries' },
  { href: '/events/', label: 'Events calendar' },
  { href: '/organizations/', label: 'Organizations' },
  { href: '/newsletter/', label: 'Newsletter' },
  { href: '/feed.xml', label: 'RSS feed' },
];
const company = [
  { href: '/about/', label: 'About GeoInformatics' },
  { href: '/advertise/', label: 'Advertise' },
  { href: '/media-kit.pdf', label: 'Media kit (PDF)' },
  { href: '/contact/', label: 'Contact' },
];
const legal = [
  { href: '/legal/privacy/', label: 'Privacy' },
  { href: '/legal/cookies/', label: 'Cookies' },
  { href: '/legal/advertising-disclosure/', label: 'Advertising disclosure' },
  { href: '/legal/editorial-standards/', label: 'Editorial standards' },
  { href: '/legal/terms/', label: 'Terms of use' },
];

export function Footer({ preview }: { preview: boolean }) {
  const socials = [
    site.social.linkedin && { href: site.social.linkedin, label: 'LinkedIn', icon: 'linkedin' as const },
    site.social.x && { href: site.social.x, label: 'X', icon: 'x' as const },
  ].filter(Boolean) as { href: string; label: string; icon: 'linkedin' | 'x' }[];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-white">
      <div className="shell grid gap-12 pt-16 pb-12 lg:grid-cols-[1.2fr_2fr] lg:gap-20 lg:pt-24">
        <div>
          <Logo />
          <p className="mt-6 max-w-sm text-fog">{site.description}</p>
          <div className="mt-8 max-w-md">
            <p className="kicker mb-4 text-white">The weekly briefing</p>
            <NewsletterForm source="footer" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <FooterCol title="Industries" className="col-span-2 sm:col-span-2">
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={c.path} className="block py-1.5 text-[0.9375rem] text-fog transition-colors hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterCol>
          <FooterCol title="Platform">
            <List items={platform} />
          </FooterCol>
          <FooterCol title="Company">
            <List items={company} />
          </FooterCol>
        </div>
      </div>

      {/* Oversized wordmark as a closing typographic gesture */}
      <div aria-hidden="true" className="shell overflow-hidden select-none">
        <p className="font-display text-[clamp(3rem,13.4vw,13rem)] whitespace-nowrap leading-[0.8] font-semibold tracking-[-0.02em] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255)]">GeoInformatics</p>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-6 text-sm text-fog lg:flex-row lg:items-center lg:justify-between">
          <p className="meta">
            © {new Date().getFullYear()} {site.publisher.legalName || site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {socials.length > 0 && (
            <ul className="flex gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} rel="noopener me" target="_blank" aria-label={`GeoInformatics on ${s.label}`} className="grid size-10 place-items-center border border-white/15 hover:border-white">
                    <BrandIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {preview && (
          <p className="border-t border-white/10 bg-anthracite px-4 py-3 text-center text-xs text-fog">
            Preview mode: articles shown are sample content for design review. Connect WordPress (<code className="font-mono">WORDPRESS_URL</code>) to publish live news.
          </p>
        )}
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <nav aria-label={title} className={className}>
      <p className="kicker mb-4 text-white">{title}</p>
      {children}
    </nav>
  );
}

function List({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul>
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="block py-1.5 text-[0.9375rem] text-fog transition-colors hover:text-white">
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
