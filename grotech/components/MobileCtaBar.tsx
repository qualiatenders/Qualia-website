'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { href, quoteHref } from '@/lib/i18n/routes';

/** Compacte offerte-CTA onderin op mobiel, zichtbaar na het eerste scherm. */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const hidden = pathname.startsWith(href('quote')) || pathname.startsWith('/beheer');

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 520;
      setShow(window.scrollY > window.innerHeight * 0.7 && !nearBottom);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (hidden) return null;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-black/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-precise)] sm:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!show}
    >
      <Link href={quoteHref()} tabIndex={show ? 0 : -1} className="flex min-h-12 items-center justify-between rounded-[3px] bg-offwhite pr-1.5 pl-4 text-[0.8125rem] font-bold tracking-[0.12em] text-black uppercase">
        Upload je tekening — offerte
        <span className="grid size-9 place-items-center rounded-[2px] bg-red text-black">
          <Icon name="upload" size={17} strokeWidth={2} />
        </span>
      </Link>
    </div>
  );
}
