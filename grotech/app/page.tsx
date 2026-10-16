import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { Process } from '@/components/home/Process';
import { About } from '@/components/home/About';
import { ClosingCta } from '@/components/home/ClosingCta';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'GROTECH — Precision Manufacturing',
    description:
      'Specialist in aluminium: snijwerk, zetwerk, laswerk en samenstellingen in aluminium, en CNC-frezen en -draaien in alle materialen. Eén Nederlands aanspreekpunt. Upload je tekening.',
    path: '/',
  }),
  title: { absolute: 'GROTECH — Specialist in aluminium | Snij-, zet- en laswerk en CNC-verspaning' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <About />
      <ClosingCta />
    </>
  );
}
