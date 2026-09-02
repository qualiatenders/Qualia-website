import { FOOTER } from '@/lib/content';

/** Compact closing bar: links, origin, legal. Nothing that repeats the page. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-hull">
      <div className="shell flex flex-col gap-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {FOOTER.links.map((link) => {
              // De prijslijst is een PDF: net als een externe link in een
              // nieuw tabblad, zodat de bezoeker de site niet kwijtraakt.
              const external = link.href.startsWith('http') || link.href.endsWith('.pdf');
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    className="type-label text-mill transition-colors hover:text-bone"
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <p className="type-label text-deck">{FOOTER.tagline}</p>
          <p className="type-label text-deck">&copy; {year} Assault Boats</p>
        </div>
      </div>
    </footer>
  );
}
