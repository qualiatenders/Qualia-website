import { FOOTER } from '@/lib/content';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-hull pb-10 pt-20 lg:pt-28">
      <div className="shell">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* The wordmark is the footer graphic — swap for the logo asset when available. */}
            <p className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.045em] text-bone">
              Assault
              <span className="text-red">.</span>
              <br />
              Boats
            </p>
            <p className="type-label mt-6 text-mill">{FOOTER.tagline}</p>
          </div>

          <nav className="lg:col-span-5 lg:pt-3" aria-label="Footer">
            <ul className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-2">
              {FOOTER.links.map((link) => {
                const external = link.href.startsWith('http');
                return (
                  <li key={link.label} className="border-b border-white/10">
                    <a
                      href={link.href}
                      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                      className="group flex items-center justify-between gap-4 py-4 type-label text-mill transition-colors hover:text-bone"
                    >
                      {link.label}
                      <svg
                        viewBox="0 0 16 12"
                        className="h-2.5 w-3.5 shrink-0 text-deck transition-all duration-300 group-hover:translate-x-1 group-hover:text-red"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
                      </svg>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-label text-deck">&copy; {year} Assault Boats</p>
          <p className="type-label text-deck">Model 2026 · Made in NL</p>
        </div>
      </div>
    </footer>
  );
}
