import { ContactSection } from '@/components/ContactSection';
import { Gallery } from '@/components/Gallery';
import { FaqSection } from '@/components/FaqSection';
import { Hero } from '@/components/Hero';
import { Intro } from '@/components/Intro';
import { ModelSelector } from '@/components/ModelSelector';
import { SpecsGrid } from '@/components/SpecsGrid';
import { FAQ_HOME, MODEL_PRICES } from '@/lib/content';
import { faqSchema, jsonLd, pageMetadata, productSchema } from '@/lib/seo';

export const metadata = pageMetadata({
  route: 'home',
  title: 'Aluminium visboten uit Nederland',
  ogTitle: 'Assault Boats — aluminium visboten uit Nederland',
  description:
    'Gelaste aluminium visboten uit Nederland. De Assault 500 is een V-jon van 5 meter in 4 mm 5083, open of als Fish met werpdek. Vanaf € 9.575 incl. btw.',
});

export default function HomePage() {
  return (
    <>
      {/*
        De homepage is voor vrijwel iedere bezoeker de hele site, dus hier
        staan ook de gegevens over het product en de vragen. Het @id is
        hetzelfde als op /assault-500/, net als de url: zo is het voor Google
        één product op twee pagina's en niet twee losse producten.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          productSchema({
            id: 'product-assault-500',
            name: 'Assault 500',
            description:
              'Aluminium V-jon van 5,00 meter in 4 mm 5083, binnen en buiten gelast, met zelflozend dek en tiller-besturing als standaard.',
            path: '/assault-500/',
            imagePath: '/og/assault-boats.jpg',
            price: MODEL_PRICES.open,
            extraProperties: [
              { name: 'Lengte', value: '5,00 m' },
              { name: 'Breedte', value: '1,95 m' },
              { name: 'Plaatdikte', value: '4 mm' },
              { name: 'Gewicht romp', value: '320 kg' },
              { name: 'Maximaal motorvermogen', value: '80 pk' },
              { name: 'Besturing', value: 'Tiller standaard, stuurconsole optioneel' },
              { name: 'CE-ontwerpcategorie', value: 'D (beschutte wateren)' },
            ],
          }),
        )}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(FAQ_HOME))} />

      <Hero />
      <Intro />
      <ModelSelector />
      <SpecsGrid />
      <Gallery />
      <FaqSection />
      <ContactSection />
    </>
  );
}
