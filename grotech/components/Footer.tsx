import Link from 'next/link';
import { LogoLockup } from './Logo';
import { Icon } from './Icon';
import { href, serviceHref, quoteHref } from '@/lib/i18n/routes';
import { services } from '@/lib/content/nl/services';
import { site, hasAddress, phoneHref } from '@/lib/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-line bg-black">
      <div className="container-x grid gap-12 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-4">
          <Link href={href('home')} aria-label="GROTECH — naar de homepage" className="inline-block rounded-sm">
            <LogoLockup size="lg" />
          </Link>
          <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-muted">
            Technische precisie. Zonder onnodige complexiteit. Eén Nederlands aanspreekpunt voor CNC-werk, plaatbewerking en samenstellingen.
          </p>
          <Link href={quoteHref()} className="group mt-8 inline-flex items-center gap-3 text-sm font-bold tracking-[0.12em] uppercase">
            <span className="grid size-9 place-items-center rounded-[2px] bg-red text-black">
              <Icon name="upload" size={16} strokeWidth={2} />
            </span>
            Upload je tekening
          </Link>
        </div>

        <nav aria-label="Footer" className="md:col-span-4">
          <h2 className="label-caps text-muted">Navigatie</h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {[
              ['Diensten', href('services')],
              ['Werkwijze', href('process')],
              ['Over GROTECH', href('about')],
              ['Offerte aanvragen', href('quote')],
              ['Contact', href('contact')],
              ...services.map((s) => [s.name, serviceHref(s.slug)] as const),
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h!} className="text-[0.9375rem] text-mist transition-colors hover:text-offwhite">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="label-caps text-muted">Contact</h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem] text-mist">
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 transition-colors hover:text-offwhite">
                  <Icon name="mail" size={18} className="text-red" />
                  {site.email}
                </a>
              </li>
            )}
            {site.phone && (
              <li>
                <a href={phoneHref(site.phone)} className="inline-flex items-center gap-3 transition-colors hover:text-offwhite">
                  <Icon name="phone" size={18} className="text-red" />
                  {site.phone}
                </a>
              </li>
            )}
            {hasAddress() && (
              <li className="flex gap-3">
                <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-red" />
                <span>
                  {site.address.street}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </span>
              </li>
            )}
            <li>
              <Link href={href('contact')} className="inline-flex items-center gap-2 font-bold text-offwhite">
                Neem contact op <Icon name="arrow-right" size={16} className="text-red" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-4 py-6 text-[0.8125rem] text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName}
            {site.kvk && <> · KvK {site.kvk}</>}
            {site.vat && <> · Btw {site.vat}</>}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href={href('privacy')} className="hover:text-offwhite">Privacyverklaring</Link></li>
            <li><Link href={href('disclaimer')} className="hover:text-offwhite">Disclaimer</Link></li>
          </ul>
          <p className="label-caps text-[0.625rem] tracking-[0.28em]">Engineering <span className="text-red">|</span> CNC Machining <span className="text-red">|</span> Global Production</p>
        </div>
      </div>
    </footer>
  );
}
