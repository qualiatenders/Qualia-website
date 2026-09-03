import { ContactSection } from '@/components/ContactSection';
import { Gallery } from '@/components/Gallery';
import { Hero } from '@/components/Hero';
import { Intro } from '@/components/Intro';
import { ModelSelector } from '@/components/ModelSelector';
import { SpecsGrid } from '@/components/SpecsGrid';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  route: 'home',
  title: 'Aluminium visboot & V-jon uit Nederland',
  ogTitle: 'Assault Boats — aluminium V-jons uit Nederland',
  description:
    'Assault Boats bouwt aluminium V-jons in Nederland. De Assault 500 is 5 meter lang, 4 mm dik en leverbaar als open uitvoering of als Fish met vast werpdek. Vanaf € 9.575 incl. btw.',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <ModelSelector />
      <SpecsGrid />
      <Gallery />
      <ContactSection />
    </>
  );
}
