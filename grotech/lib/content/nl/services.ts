import type { Service } from '../types';

const commonFormats = 'STEP/STP, IGES, DXF, DWG, PDF-tekening of ZIP';
const allMaterials = 'Aluminium, RVS, staal, messing, koper en technische kunststoffen';

/**
 * Positionering: GROTECH is gespecialiseerd in aluminium. Snijwerk, zetwerk en
 * laswerk uitsluitend in aluminium; CNC-verspaning (frezen en draaien) in alle
 * gangbare materialen.
 */
export const services: Service[] = [
  {
    slug: 'cnc-frezen',
    technique: 'frezen',
    index: '01',
    name: 'CNC-frezen',
    short: 'CNC-frezen',
    label: 'CNC Milling',
    tagline: 'Precisiefreeswerk in aluminium én alle andere gangbare materialen.',
    intro:
      'Gefreesde onderdelen volgens jouw 3D-model en tekening, van een enkel prototype tot terugkerende series. Aluminium is onze specialiteit, maar we verspanen net zo goed RVS, staal, messing, koper en technische kunststoffen.',
    image: { src: '/images/renders/housing.webp', alt: 'Gefreesd aluminium behuizingsblok op een CNC-machinetafel met spanen, met RVS-, messing- en kunststofdelen op de achtergrond' },
    highlights: ['Alle materialen: aluminium, RVS, staal, messing, koper, kunststof', '3-, 4- en 5-assige bewerking waar beschikbaar', 'Prototypes en seriematige productie'],
    capabilities: [
      {
        title: '3-, 4- en 5-assig',
        text: 'Afhankelijk van de geometrie zetten we 3-, 4- of 5-assige bewerking in, waar beschikbaar binnen ons netwerk. Meerzijdige bewerking in minder opspanningen helpt bij complexe vormen en onderlinge maatvoering.',
      },
      {
        title: 'Prototype tot serie',
        text: 'Eén proefexemplaar om een ontwerp te valideren, of een serie voor productie. Bij series werken we bij voorkeur eerst met een goedgekeurd proefexemplaar.',
      },
      {
        title: 'Alle materialen',
        text: 'Aluminium is onze specialiteit. Voor verspaning werken we ook in RVS, staal, messing, koper en technische kunststoffen; kwaliteiten bevestigen we per aanvraag.',
      },
      {
        title: 'Nabewerkingen',
        text: 'Anodiseren, poedercoaten of stralen nemen we desgewenst mee in de offerte. Mogelijkheden en specificaties bevestigen we per aanvraag.',
      },
    ],
    specs: [
      { label: 'Bewerking', value: '3-, 4- en 5-assig frezen, waar beschikbaar' },
      { label: 'Materialen', value: allMaterials },
      { label: 'Aantallen', value: 'Enkelstuks, prototypes en series' },
      { label: 'Aanlevering', value: commonFormats },
      { label: 'Toleranties', value: 'Volgens tekening; haalbaarheid bevestigen we per aanvraag' },
      { label: 'Levertijd', value: 'Afhankelijk van aantal, materiaal en bewerking; vermeld in de offerte' },
    ],
    applications: ['Machinebouw en automatisering', 'Behuizingen en montageplaten', 'Mallen en opspanmiddelen', 'Maritieme en jachtbouwtoepassingen', 'Engineering- en ontwikkelprojecten'],
    deliverables: ['3D-model als STEP/STP (bij voorkeur)', '2D-tekening als PDF met toleranties, passingen en schroefdraad', 'Materiaal en eventuele oppervlaktebehandeling', 'Aantallen en gewenste leverdatum'],
    related: ['cnc-draaien', 'aluminium-laswerk', 'aluminium-snijwerk'],
    faq: [
      {
        q: 'Produceert GROTECH zelf alle onderdelen?',
        a: 'Nee, en dat zeggen we liever eerlijk. GROTECH werkt met zorgvuldig geselecteerde nationale en internationale productiepartners; bepaalde werkzaamheden voeren we in eigen beheer uit. Jij hebt één aanspreekpunt in Nederland dat de tekening beoordeelt, de productie organiseert en de kwaliteit bewaakt.',
      },
      {
        q: 'Welke toleranties zijn haalbaar?',
        a: 'Dat hangt af van materiaal, geometrie, afmetingen en de gekozen productiepartner. We beoordelen de toleranties op je tekening en bevestigen in de offerte wat haalbaar is. We noemen bewust geen standaardgetal vooraf.',
      },
      {
        q: 'Kan ik eerst één proefexemplaar laten maken?',
        a: 'Ja. Voor series adviseren we zelfs om eerst een proefexemplaar te laten maken en goed te keuren, zodat de serie op een gecontroleerde basis wordt geproduceerd.',
      },
    ],
    seo: {
      title: 'CNC-frezen in aluminium, RVS, staal en kunststof',
      description: 'CNC-frezen van precisieonderdelen in aluminium, RVS, staal, messing, koper en kunststof. Van prototype tot serie. Upload je tekening voor een offerte.',
    },
  },
  {
    slug: 'cnc-draaien',
    technique: 'draaien',
    index: '02',
    name: 'CNC-draaien',
    short: 'CNC-draaien',
    label: 'CNC Turning',
    tagline: 'Draaiwerk in alle gangbare materialen, exact volgens tekening.',
    intro:
      'Assen, bussen, flenzen, pennen en andere draaidelen. In aluminium, maar ook in RVS, staal, messing, koper en technische kunststoffen. Wij vertalen jouw tekening naar een heldere productie-opdracht.',
    image: { src: '/images/renders/shaft.webp', alt: 'Gedraaide onderdelen in aluminium, RVS, messing en kunststof op een donkere ondergrond' },
    highlights: ['Alle materialen: aluminium, RVS, staal, messing, koper, kunststof', 'Enkelstuks en series op aanvraag', 'Onderdelen volgens aangeleverde tekeningen'],
    capabilities: [
      { title: 'Industrieel draaiwerk', text: 'Assen, bussen, ringen, flenzen en draaidelen met schroefdraad, steekgroeven of kartel.' },
      { title: 'Enkelstuks en series', text: 'Een vervangend onderdeel voor onderhoud of een serie voor productie. Aantallen en planning stemmen we per aanvraag af.' },
      { title: 'Draai-freescombinaties', text: 'Onderdelen met zowel draai- als freeskenmerken nemen we in één aanvraag mee.' },
      { title: 'Volgens tekening', text: 'We werken op basis van jouw tekening, inclusief toleranties, passingen en ruwheidseisen.' },
    ],
    specs: [
      { label: 'Bewerking', value: 'CNC-draaien, waar nodig gecombineerd met frezen' },
      { label: 'Materialen', value: allMaterials },
      { label: 'Aantallen', value: 'Enkelstuks en series op aanvraag' },
      { label: 'Aanlevering', value: commonFormats },
      { label: 'Toleranties', value: 'Volgens tekening; haalbaarheid bevestigen we per aanvraag' },
      { label: 'Levertijd', value: 'Afhankelijk van aantal, materiaal en bewerking; vermeld in de offerte' },
    ],
    applications: ['Assen, bussen en lagerzittingen', 'Flenzen en koppelstukken', 'Vervangende onderdelen voor onderhoud', 'Hydrauliek- en pneumatiekcomponenten', 'Maritieme beslag- en constructiedelen'],
    deliverables: ['2D-tekening als PDF met diameters, toleranties en schroefdraad', '3D-model als STEP/STP, indien beschikbaar', 'Materiaal en eventuele oppervlaktebehandeling', 'Aantallen en gewenste leverdatum'],
    related: ['cnc-frezen', 'aluminium-laswerk', 'aluminium-zetwerk'],
    faq: [
      { q: 'Leveren jullie ook kleine aantallen?', a: 'Ja, ook enkelstuks zijn bespreekbaar. Bij kleine aantallen wegen instelkosten zwaarder; dat maken we in de offerte transparant.' },
    ],
    seo: {
      title: 'CNC-draaien in aluminium, RVS, staal, messing en kunststof',
      description: 'CNC-draaien van assen, bussen, flenzen en draaidelen in alle gangbare materialen. Enkelstuks en series op aanvraag. Vraag een offerte aan.',
    },
  },
  {
    slug: 'aluminium-snijwerk',
    technique: 'snijwerk',
    index: '03',
    name: 'Aluminium snijwerk',
    short: 'Snijwerk',
    label: 'Aluminium Cutting',
    tagline: 'Aluminium plaatdelen, gesneden volgens DXF of tekening.',
    intro:
      'Snijwerk doen we uitsluitend in aluminium, en dat merk je. We kiezen per opdracht de techniek die past bij legering, dikte, randkwaliteit en budget, van losse onderdelen tot complete plaatpakketten.',
    image: { src: '/images/renders/plate.webp', alt: 'Lasersnijkop snijdt een contour in een aluminium plaat, met een vonkenregen onder de plaat' },
    highlights: ['Uitsluitend aluminium: specialistische kennis van legeringen en diktes', 'Lasersnijden, watersnijden of alternatieve technieken', 'Van losse onderdelen tot complete plaatpakketten'],
    capabilities: [
      { title: 'Lasersnijden', text: 'Nauwkeurige contouren en kleine details in aluminium plaat. Of laser de beste keuze is, hangt af van dikte en eisen aan de snijkant.' },
      { title: 'Watersnijden', text: 'Koud snijden zonder warmte-inbreng, interessant bij dikke aluminium plaat of waar warmtebeïnvloeding ongewenst is.' },
      { title: 'Alternatieve technieken', text: 'Afhankelijk van de opdracht kan een andere techniek passender zijn. We adviseren op basis van tekening en eisen.' },
      { title: 'Complete plaatpakketten', text: 'Meerdere onderdelen en diktes in één aanvraag, desgewenst gecombineerd met zetten, tappen of lassen.' },
    ],
    specs: [
      { label: 'Materiaal', value: 'Uitsluitend aluminium; legering en dikte per aanvraag te bevestigen' },
      { label: 'Technieken', value: 'Lasersnijden, watersnijden of alternatief, afhankelijk van de opdracht' },
      { label: 'Aantallen', value: 'Losse onderdelen tot complete plaatpakketten' },
      { label: 'Aanlevering', value: 'DXF (bij voorkeur 1:1, per onderdeel), DWG, STEP of PDF-tekening' },
      { label: 'Levertijd', value: 'Afhankelijk van aantal en vervolgbewerkingen; vermeld in de offerte' },
    ],
    applications: ['Montage- en afdekplaten', 'Frames, schotten en verstevigingen', 'Behuizingen en panelen', 'Jacht- en scheepsbouw', 'Plaatpakketten voor machinebouw'],
    deliverables: ['DXF per onderdeel, schaal 1:1, zonder maatlijnen in de snijcontour', 'Aluminiumlegering en plaatdikte', 'Aantallen per onderdeel', 'Eventuele vervolgbewerking: zetten, tappen, verzinken, ontbramen'],
    related: ['aluminium-zetwerk', 'aluminium-laswerk', 'cnc-frezen'],
    faq: [
      { q: 'Hoe lever ik DXF-bestanden het beste aan?', a: 'Bij voorkeur één DXF per onderdeel, op schaal 1:1, met alleen de snijcontouren. Zet aantallen, legering en dikte in de bestandsnaam of in de aanvraag.' },
    ],
    seo: {
      title: 'Aluminium snijwerk — laser- en watersnijden volgens DXF',
      description: 'Specialist in aluminium plaatdelen, gesneden volgens DXF of tekening. Lasersnijden, watersnijden of alternatieve technieken, van losse delen tot plaatpakketten.',
    },
  },
  {
    slug: 'aluminium-zetwerk',
    technique: 'zetwerk',
    index: '04',
    name: 'Aluminium zetwerk',
    short: 'Zetwerk',
    label: 'Aluminium Forming',
    tagline: 'Gezette aluminium plaatdelen voor machinebouw, constructie en maritiem.',
    intro:
      'CNC-kantwerk uitsluitend in aluminium: beugels, profielen, kasten en afdekkappen. Juist bij aluminium luisteren legering, hardheid en buigradius nauw. Daarom controleren we vooraf de zetvolgorde, radii en uitslag.',
    image: { src: '/images/renders/bracket.webp', alt: 'Kantbank met stempel en matrijs die een aluminium plaat zet, met een gezet aluminium profiel op de voorgrond' },
    highlights: ['Uitsluitend aluminium, met oog voor legering en buigradius', 'CNC-kantwerk van plaatdelen', 'Machinebouw, constructie en maritieme toepassingen'],
    capabilities: [
      { title: 'CNC-kantwerk', text: 'Gezette aluminium delen op CNC-gestuurde kantbanken, voor herhaalbare hoeken en maatvoering.' },
      { title: 'Uitslag en maakbaarheid', text: 'Met een 3D-model controleren we uitslag, flenslengtes en buigradii, en stellen we waar nodig een aanpassing voor.' },
      { title: 'Snijden en zetten in één', text: 'De aluminium plaat wordt gesneden, ontbraamd en gezet, eventueel aangevuld met inpersmoeren, tappen of lassen.' },
      { title: 'Maritiem en constructie', text: 'Beugels, consoles, afdekkappen en constructiedelen in aluminium, onder meer voor machinebouw en jachtbouw.' },
    ],
    specs: [
      { label: 'Materiaal', value: 'Uitsluitend aluminium; zetbaarheid per legering en hardheid te bevestigen' },
      { label: 'Bewerking', value: 'CNC-kantwerk van plaatdelen' },
      { label: 'Aantallen', value: 'Enkelstuks, prototypes en series' },
      { label: 'Aanlevering', value: 'STEP (gezet model), DXF-uitslag en/of PDF-tekening' },
      { label: 'Levertijd', value: 'Afhankelijk van aantal en vervolgbewerkingen; vermeld in de offerte' },
    ],
    applications: ['Beugels, consoles en hoekprofielen', 'Kasten, afdekkappen en panelen', 'Constructiedelen', 'Maritiem en jachtbouw', 'Machinebouw en installatietechniek'],
    deliverables: ['3D-model als STEP (bij voorkeur het gezette model)', 'PDF-tekening met binnen- of buitenmaten en hoeken', 'Aluminiumlegering en plaatdikte', 'Aantallen en eventuele vervolgbewerkingen'],
    related: ['aluminium-snijwerk', 'aluminium-laswerk', 'cnc-frezen'],
    faq: [
      { q: 'Welke aluminiumlegeringen zijn geschikt om te zetten?', a: 'Niet elke legering en hardheid laat zich even goed zetten. We kijken mee naar de combinatie van legering, dikte en buigradius en bevestigen de mogelijkheden per aanvraag.' },
    ],
    seo: {
      title: 'Aluminium zetwerk — CNC-kantwerk van aluminium plaatdelen',
      description: 'Specialist in aluminium zetwerk en CNC-kantwerk voor machinebouw, constructie en maritieme toepassingen. Snijden en zetten uit één hand.',
    },
  },
  {
    slug: 'aluminium-laswerk',
    technique: 'laswerk',
    index: '05',
    name: 'Aluminium laswerk & samenstellingen',
    short: 'Laswerk',
    label: 'Aluminium Welding',
    tagline: 'Gelaste aluminium constructies, van lasdeel tot complete samenstelling.',
    intro:
      'Aluminium lassen vraagt vakmanschap: de oxidehuid, warmtegeleiding en vervorming maken het anders dan staal. Wij lassen uitsluitend aluminium en brengen snij-, zet- en freeswerk samen tot één onderdeel dat klaar is voor montage.',
    image: { src: '/images/renders/frame.webp', alt: 'TIG-toorts last een aluminium kokerverbinding, met een gelijkmatige lasrups en lichtboog' },
    highlights: ['Uitsluitend aluminium', 'TIG- en MIG-lassen', 'Complete gelaste constructies en samenstellingen'],
    capabilities: [
      { title: 'TIG en MIG', text: 'TIG voor zichtwerk en dunne wanden, MIG voor zwaardere constructies. Het proces kiezen we op basis van wanddikte en afwerking.' },
      { title: 'Specialist in aluminium', text: 'Voorbereiding, reiniging en warmtebeheersing zijn bij aluminium bepalend voor een sterke, strakke las.' },
      { title: 'Complete samenstellingen', text: 'Gesneden, gezette en verspaande aluminium delen samengebracht tot één constructie. Eén aanvraag, één levering.' },
      { title: 'Nabehandeling', text: 'Stralen, richten of anodiseren nemen we desgewenst mee. Eisen aan lasnaden en afwerking leggen we vooraf vast.' },
    ],
    specs: [
      { label: 'Materiaal', value: 'Uitsluitend aluminium' },
      { label: 'Processen', value: 'TIG en MIG' },
      { label: 'Omvang', value: 'Van eenvoudige lasdelen tot complete samenstellingen' },
      { label: 'Aanlevering', value: `${commonFormats}; bij voorkeur met samenstellingstekening en lassymbolen` },
      { label: 'Kwalificaties', value: 'Specifieke eisen aan lasmethode of documentatie vooraf afstemmen' },
    ],
    applications: ['Aluminium frames en onderstellen', 'Consoles, steunen en bordessen', 'Maritieme constructies en jachtbouw', 'Behuizingen en kasten', 'Samenstellingen voor de machinebouw'],
    deliverables: ['Samenstellingstekening (PDF) met lassymbolen en hoofdmaten', '3D-model als STEP, indien beschikbaar', 'Aluminiumlegering en eventuele nabehandeling', 'Eisen aan lasnaden, kwalificaties of documentatie'],
    related: ['aluminium-snijwerk', 'aluminium-zetwerk', 'cnc-frezen'],
    faq: [
      {
        q: 'Kunnen jullie gecertificeerd laswerk leveren?',
        a: 'Als je project specifieke eisen stelt aan lasmethodes, kwalificaties of documentatie, geef dat dan aan in je aanvraag. We bevestigen per opdracht wat we kunnen leveren en doen geen toezeggingen die we niet kunnen onderbouwen.',
      },
    ],
    seo: {
      title: 'Aluminium laswerk & samenstellingen — TIG en MIG',
      description: 'Specialist in aluminium laswerk: TIG en MIG, van lasdeel tot complete samenstelling. Snij-, zet- en laswerk in aluminium uit één hand.',
    },
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
