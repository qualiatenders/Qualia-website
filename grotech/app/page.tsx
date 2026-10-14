import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { Intro } from '@/components/home/Intro';
import { ServicesExplorer } from '@/components/home/ServicesExplorer';
import { VisualBlock } from '@/components/home/VisualBlock';
import { Process } from '@/components/home/Process';
import { Materials } from '@/components/home/Materials';
import { Quality } from '@/components/home/Quality';
import { ClosingCta } from '@/components/home/ClosingCta';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'GROTECH — Precision Manufacturing',
    description:
      'Van CNC-precisieonderdelen tot complete metalen samenstellingen. CNC-frezen, CNC-draaien, aluminium snij- en zetwerk en laswerk via één Nederlands aanspreekpunt. Upload je tekening.',
    path: '/',
  }),
  title: { absolute: 'GROTECH — Precision Manufacturing | CNC-werk, plaatbewerking en samenstellingen' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <ServicesExplorer />
      <VisualBlock />
      <Process />
      <Materials />
      <Quality />
      <ClosingCta />
    </>
  );
}
