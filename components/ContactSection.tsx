import { CONTACT } from '@/lib/content';
import { ArrowLink } from './ArrowLink';
import { Media } from './Media';
import { Reveal } from './Reveal';

/** WhatsApp glyph, drawn in currentColor so it stays inside the house style. */
function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.86 9.86 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.15 8.15 0 0 1-1.25-4.34c0-4.52 3.68-8.19 8.2-8.19a8.15 8.15 0 0 1 8.19 8.2c0 4.51-3.68 8.17-8.19 8.17Zm4.5-6.12c-.25-.13-1.46-.72-1.68-.8-.23-.08-.39-.13-.56.12-.16.25-.63.8-.78.96-.14.17-.28.19-.53.06-.24-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.05-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.66 4.2 3.73.59.25 1.05.4 1.4.52.6.18 1.14.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

/** 06 — the invitation to come and stand in the boat. */
export function ContactSection() {
  return (
    <section id="contact" className="border-t border-white/10 bg-hull">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <Media
            media={CONTACT.media}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full lg:!aspect-auto lg:absolute lg:inset-0"
          />
        </div>

        <div className="order-1 px-[clamp(1.25rem,4.5vw,5rem)] py-24 lg:order-2 lg:py-36 lg:pr-[clamp(1.25rem,4.5vw,5rem)] lg:pl-16">
          <div className="max-w-xl">
            <Reveal className="flex items-center gap-4">
              <span className="type-label text-red">{CONTACT.index}</span>
              <span className="h-px w-8 bg-white/15" aria-hidden="true" />
              <span className="type-label text-mill">Contact</span>
            </Reveal>

            <Reveal delay={0.08} className="mt-7">
              <h2 className="type-h2">{CONTACT.title}</h2>
            </Reveal>

            <Reveal delay={0.14} as="p" className="type-body mt-5 text-mill">
              {CONTACT.body}
            </Reveal>

            <dl className="mt-12 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {CONTACT.details.map((detail, i) => (
                <Reveal key={detail.label} delay={0.06 + i * 0.05} className="border-t border-white/12 py-5">
                  <dt className="type-label text-mill">{detail.label}</dt>
                  <dd
                    className={`mt-2 text-[1.0625rem] font-medium ${
                      detail.pending ? 'text-deck underline decoration-dotted underline-offset-4' : 'text-bone'
                    }`}
                    title={detail.pending ? 'Nog in te vullen' : undefined}
                  >
                    {detail.value}
                  </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
              <ArrowLink href={CONTACT.primary.href}>{CONTACT.primary.label}</ArrowLink>
              <ArrowLink href={CONTACT.whatsapp.href} variant="outline" icon={<WhatsAppMark />}>
                {CONTACT.whatsapp.label}
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
