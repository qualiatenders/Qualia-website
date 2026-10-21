'use client';

import { useState } from 'react';
import { BrandIcon, Icon } from '../Icon';

/** Share links. No third-party scripts: plain intent URLs plus copy-link and the native share sheet. */
export function ShareBar({ url, title, vertical = false }: { url: string; title: string; vertical?: boolean }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { label: 'Share on LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, icon: <BrandIcon name="linkedin" /> },
    { label: 'Share on X', href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`, icon: <BrandIcon name="x" /> },
    { label: 'Share on Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: <BrandIcon name="facebook" /> },
    { label: 'Share by email', href: `mailto:?subject=${enc(title)}&body=${enc(url)}`, icon: <Icon name="mail" className="size-4" /> },
  ];

  async function copy() {
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  }

  const btn = 'grid size-10 place-items-center border border-line-strong text-fg-muted transition-colors hover:border-[color:var(--fg)] hover:text-fg';
  return (
    <div className={`flex gap-2 ${vertical ? 'flex-col' : 'flex-row flex-wrap items-center'}`}>
      <span className={`kicker text-fg-subtle ${vertical ? 'mb-1' : 'mr-2'}`}>Share</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener" aria-label={l.label} className={btn}>
          {l.icon}
        </a>
      ))}
      <button type="button" onClick={copy} aria-label={copied ? 'Link copied' : 'Copy link'} className={btn}>
        <Icon name={copied ? 'check' : 'link'} className="size-4" />
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </div>
  );
}
