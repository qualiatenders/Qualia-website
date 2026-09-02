'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CONTACT, PRICE_CTA } from '@/lib/content';

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.86 9.86 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.15 8.15 0 0 1-1.25-4.34c0-4.52 3.68-8.19 8.2-8.19a8.15 8.15 0 0 1 8.19 8.2c0 4.51-3.68 8.17-8.19 8.17Zm4.5-6.12c-.25-.13-1.46-.72-1.68-.8-.23-.08-.39-.13-.56.12-.16.25-.63.8-.78.96-.14.17-.28.19-.53.06-.24-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.05-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.66 4.2 3.73.59.25 1.05.4 1.4.52.6.18 1.14.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

/**
 * The two actions that matter, kept within reach for the whole page.
 *
 * Appears once the hero is behind you and steps aside when the price-list
 * section is on screen, so the same call to action is never on screen twice.
 */
export function StickyCTA() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.7;
      // Step aside over the closing block so the footer stays uncluttered.
      const footer = document.querySelector('footer');
      const atFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      setVisible(pastHero && !atFooter);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 flex justify-end px-[clamp(1.25rem,4.5vw,5rem)] pb-5 lg:bottom-8 lg:pb-0"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex w-full gap-2 lg:w-auto lg:flex-col lg:items-end lg:gap-2.5">
            <a
              href={PRICE_CTA.cta.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-1 items-center justify-center gap-2.5 rounded-[2px] border border-white/20 bg-hull/92 px-5 py-3.5 type-label text-bone shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors duration-300 hover:border-white/45 lg:flex-none lg:justify-start"
            >
              <svg viewBox="0 0 14 16" className="h-4 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M7 0v11M2.5 7 7 11.5 11.5 7M0 15h14" />
              </svg>
              Prijslijst
            </a>

            <a
              href={CONTACT.whatsapp.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-1 items-center justify-center gap-2.5 rounded-[2px] bg-red px-5 py-3.5 type-label text-white shadow-[0_8px_30px_rgba(192,39,44,0.35)] transition-colors duration-300 hover:bg-red-hot lg:flex-none lg:justify-start"
            >
              <WhatsAppMark />
              WhatsApp
            </a>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
