import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { Gallery } from '@/components/Gallery';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Intro } from '@/components/Intro';
import { ModelSelector } from '@/components/ModelSelector';
import { SpecsGrid } from '@/components/SpecsGrid';
import { StickyCTA } from '@/components/StickyCTA';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Intro />
        <ModelSelector />
        <SpecsGrid />
        <Gallery />
        <ContactSection />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
