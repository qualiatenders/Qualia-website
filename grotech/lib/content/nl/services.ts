import type { Service } from '../types';

const commonFormats = 'STEP/STP, IGES, DXF, DWG, PDF-tekening of ZIP';

export const services: Service[] = [
  {
    slug: 'cnc-frezen',
    technique: 'frezen',
    index: '01',
    name: 'CNC-frezen',
    short: 'CNC-frezen',
    label: 'CNC Milling',
    tagline: 'Complexe precisieonderdelen, van prototype tot serie.',
    intro:
      'Gefreesde onderdelen volgens jouw 3D-model en tekening. Van een enkel prototype tot terugkerende series: wij beoordelen de tekening, kiezen de passende productiepartner en bewaken de uitvoering tot aan levering.',
    image: { src: '/images/renders/housing.webp', alt: 'Illustratieve render van een gefreesd aluminium behuizingsblok met kamers, boringen en verzinkingen' },
    highlights: ['3-, 4- en 5-assige bewerking waar beschikbaar', 'Prototypes en seriematige productie', 'Complexe precisieonderdelen'],
    capabilities: [
      {
        title: '3-, 4- en 5-assig',
        text: 'Afhankelijk van de geometrie zetten we 3-, 4- of 5-assige bewerking in, waar beschikbaar binnen ons partnernetwerk. Meerzijdige bewerking in minder opspanningen helpt bij complexe vormen en onderlinge maatvoering.',
      },
      {
        title: 'Prototype tot serie',
        text: 'Eén proefexemplaar om een ontwerp te valideren, of een serie voor productie. Bij series werken we bij voorkeur eerst met een goedgekeurd proefexemplaar voordat de volledige aantallen worden geproduceerd.',
      },
      {
        title: 'Complexe geometrie',
        text: 'Kamers, dunne wanden, schroefdraad, passingen en vrije vormen. We kijken vooraf mee naar maakbaarheid en geven aan waar een kleine ontwerpaanpassing kosten of risico kan verlagen.',
      },
      {
        title: 'Nabewerkingen',
        text: 'Oppervlaktebehandelingen zoals anodiseren, poedercoaten of stralen kunnen we meenemen in de offerte. Mogelijkheden en specificaties bevestigen we per aanvraag.',
      },
    ],
    specs: [
      { label: 'Bewerking', value: '3-, 4- en 5-assig frezen, waar beschikbaar' },
      { label: 'Aantallen', value: 'Enkelstuks, prototypes en series' },
      { label: 'Materialen', value: 'Aluminium, RVS, staal, messing, koper en technische kunststoffen' },
      { label: 'Toleranties', value: 'Volgens tekening; haalbaarheid bevestigen we per aanvraag' },
      { label: 'Aanlevering', value: commonFormats },
      { label: 'Levertijd', value: 'Afhankelijk van aantal, materiaal en bewerking; vermeld in de offerte' },
    ],
    applications: ['Machinebouw en automatisering', 'Behuizingen en montageplaten', 'Mallen, opspanmiddelen en mallendelen', 'Maritieme en jachtbouwtoepassingen', 'Onderdelen voor engineering- en ontwikkelprojecten'],
    deliverables: [
      '3D-model als STEP/STP (bij voorkeur)',
      '2D-tekening als PDF met toleranties, passingen en schroefdraad',
      'Materiaal en eventuele oppervlaktebehandeling',
      'Aantallen, inclusief verwachte herhaalorders',
      'Gewenste leverdatum',
    ],
    related: ['cnc-draaien', 'laswerk-samenstellingen', 'aluminium-snijwerk'],
    faq: [
      {
        q: 'Produceert GROTECH zelf alle freesdelen?',
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
      {
        q: 'Wat als ik alleen een 2D-tekening heb?',
        a: 'Stuur die gerust mee. Voor freeswerk werkt een 3D-model (STEP) meestal sneller en nauwkeuriger, maar een volledig bemaatte PDF-tekening is vaak voldoende om een eerste beoordeling te doen.',
      },
    ],
    seo: {
      title: 'CNC-frezen — prototypes en series volgens tekening',
      description:
        'CNC-frezen van precisieonderdelen in aluminium, RVS, staal en kunststof. 3-, 4- en 5-assig waar beschikbaar, van prototype tot serie. Upload je tekening voor een offerte.',
    },
  },
  {
    slug: 'cnc-draaien',
    technique: 'draaien',
    index: '02',
    name: 'CNC-draaien',
    short: 'CNC-draaien',
    label: 'CNC Turning',
    tagline: 'Draaiwerk voor industriële toepassingen, exact volgens tekening.',
    intro:
      'Assen, bussen, flenzen, pennen en andere rotatiesymmetrische onderdelen. Wij vertalen jouw tekening naar een heldere productie-opdracht en zorgen dat het onderdeel wordt gemaakt zoals bedoeld.',
    image: { src: '/images/renders/shaft.webp', alt: 'Illustratieve render van een gedraaide stalen as met flens, steekgroef en boringen' },
    highlights: ['Draaiwerk voor industriële toepassingen', 'Enkelstuks en series op aanvraag', 'Onderdelen volgens aangeleverde tekeningen'],
    capabilities: [
      {
        title: 'Industrieel draaiwerk',
        text: 'Assen, bussen, ringen, flenzen, afstandsstukken en draaidelen met schroefdraad, steekgroeven of kartel. Gericht op functionele onderdelen voor machines en installaties.',
      },
      {
        title: 'Enkelstuks en series',
        text: 'Een vervangend onderdeel voor onderhoud of een serie voor productie. Aantallen en planning stemmen we per aanvraag af.',
      },
      {
        title: 'Draai-freescombinaties',
        text: 'Onderdelen met zowel draai- als freeskenmerken, zoals vlakken, sleufgaten of boringen op de omtrek, nemen we in één aanvraag mee.',
      },
      {
        title: 'Volgens tekening',
        text: 'We werken op basis van jouw tekening, inclusief toleranties, passingen en ruwheidseisen. Onduidelijkheden stemmen we vooraf af, niet achteraf.',
      },
    ],
    specs: [
      { label: 'Bewerking', value: 'CNC-draaien, waar nodig gecombineerd met frezen' },
      { label: 'Aantallen', value: 'Enkelstuks en series op aanvraag' },
      { label: 'Materialen', value: 'Aluminium, RVS, staal, messing, koper en technische kunststoffen' },
      { label: 'Toleranties', value: 'Volgens tekening; haalbaarheid bevestigen we per aanvraag' },
      { label: 'Aanlevering', value: commonFormats },
      { label: 'Levertijd', value: 'Afhankelijk van aantal, materiaal en bewerking; vermeld in de offerte' },
    ],
    applications: ['Assen, bussen en lagerzittingen', 'Flenzen en koppelstukken', 'Vervangende onderdelen voor onderhoud', 'Hydrauliek- en pneumatiekcomponenten', 'Maritieme beslag- en constructiedelen'],
    deliverables: [
      '2D-tekening als PDF met diameters, toleranties en schroefdraad',
      '3D-model als STEP/STP, indien beschikbaar',
      'Materiaal en eventuele oppervlaktebehandeling',
      'Aantallen en gewenste leverdatum',
    ],
    related: ['cnc-frezen', 'laswerk-samenstellingen', 'aluminium-zetwerk'],
    faq: [
      {
        q: 'Kunnen jullie een bestaand onderdeel namaken zonder tekening?',
        a: 'Een technische tekening is het uitgangspunt. Heb je die niet, neem dan contact op: soms kan een tekening op basis van het bestaande onderdeel worden opgesteld. Dat bespreken we per situatie.',
      },
      {
        q: 'Leveren jullie ook kleine aantallen?',
        a: 'Ja, ook enkelstuks zijn bespreekbaar. Bij kleine aantallen wegen instelkosten zwaarder; dat maken we in de offerte transparant.',
      },
      {
        q: 'Welke materialen kunnen worden gedraaid?',
        a: 'Onder meer aluminium, RVS, staal, messing, koper en technische kunststoffen. Specifieke kwaliteiten en beschikbaarheid bevestigen we per aanvraag.',
      },
    ],
    seo: {
      title: 'CNC-draaien — draaiwerk volgens tekening',
      description:
        'CNC-draaien van assen, bussen, flenzen en industriële draaidelen. Enkelstuks en series op aanvraag, in metaal en technische kunststof. Vraag een offerte aan.',
    },
  },
  {
    slug: 'aluminium-snijwerk',
    technique: 'snijwerk',
    index: '03',
    name: 'Aluminium snijwerk',
    short: 'Snijwerk',
    label: 'Cutting',
    tagline: 'Plaatdelen volgens DXF of technische tekening.',
    intro:
      'Van losse onderdelen tot complete plaatpakketten. We kiezen per opdracht de snijtechniek die past bij materiaaldikte, nauwkeurigheid, randkwaliteit en budget, en leveren de delen klaar voor verdere bewerking of montage.',
    image: { src: '/images/renders/plate.webp', alt: 'Illustratieve render van gesneden aluminium plaatdelen met gaten, sleuven en zeskantuitsparingen' },
    highlights: ['Aluminium plaatdelen volgens DXF of technische tekening', 'Lasersnijden, watersnijden of alternatieve technieken', 'Van losse onderdelen tot complete plaatpakketten'],
    capabilities: [
      {
        title: 'Lasersnijden',
        text: 'Geschikt voor nauwkeurige contouren en kleine details in dunnere plaat. Of lasersnijden de beste keuze is, hangt af van dikte, materiaal en eisen aan de snijkant.',
      },
      {
        title: 'Watersnijden',
        text: 'Een koude snijtechniek zonder warmte-inbreng in het materiaal. Interessant bij dikkere plaat of wanneer warmtebeïnvloeding ongewenst is.',
      },
      {
        title: 'Alternatieve snijtechnieken',
        text: 'Afhankelijk van de opdracht kan een andere techniek passender zijn. We adviseren op basis van jouw tekening en eisen, niet op basis van één vaste machine.',
      },
      {
        title: 'Complete plaatpakketten',
        text: 'Meerdere onderdelen, diktes en aantallen in één aanvraag. Desgewenst gecombineerd met zetwerk, draadtappen of lassen tot een samenstelling.',
      },
    ],
    specs: [
      { label: 'Technieken', value: 'Lasersnijden, watersnijden of alternatief, afhankelijk van de opdracht' },
      { label: 'Aantallen', value: 'Losse onderdelen tot complete plaatpakketten' },
      { label: 'Materialen', value: 'Aluminium; andere plaatmaterialen op aanvraag' },
      { label: 'Plaatdikte', value: 'Per aanvraag te bevestigen, afhankelijk van materiaal en techniek' },
      { label: 'Aanlevering', value: 'DXF (bij voorkeur 1:1, per onderdeel), DWG, STEP of PDF-tekening' },
      { label: 'Levertijd', value: 'Afhankelijk van aantal en vervolgbewerkingen; vermeld in de offerte' },
    ],
    applications: ['Montage- en afdekplaten', 'Frames, schotten en verstevigingen', 'Behuizingen en panelen', 'Onderdelen voor jacht- en scheepsbouw', 'Plaatpakketten voor machinebouw'],
    deliverables: [
      'DXF per onderdeel, schaal 1:1, zonder maatlijnen in de snijcontour',
      'Materiaal, legering en plaatdikte',
      'Aantallen per onderdeel',
      'Eventuele vervolgbewerking: zetten, tappen, verzinken, ontbramen',
    ],
    related: ['aluminium-zetwerk', 'laswerk-samenstellingen', 'cnc-frezen'],
    faq: [
      {
        q: 'Welke snijtechniek wordt gebruikt?',
        a: 'Dat hangt af van de opdracht. Lasersnijden, watersnijden of een alternatieve techniek: we kiezen op basis van dikte, nauwkeurigheid, randkwaliteit en kosten, en vermelden de gekozen techniek in de offerte.',
      },
      {
        q: 'Hoe lever ik DXF-bestanden het beste aan?',
        a: 'Bij voorkeur één DXF per onderdeel, op schaal 1:1, met alleen de snijcontouren. Zet aantallen, materiaal en dikte in de bestandsnaam of in de aanvraag.',
      },
      {
        q: 'Kunnen gesneden delen ook worden gezet of gelast?',
        a: 'Ja. Snijwerk combineren we vaak met zetwerk en laswerk tot een complete samenstelling, met één aanspreekpunt voor het geheel.',
      },
    ],
    seo: {
      title: 'Aluminium snijwerk — laser- en watersnijden volgens DXF',
      description:
        'Aluminium plaatdelen gesneden volgens DXF of tekening. Lasersnijden, watersnijden of alternatieve technieken, van losse delen tot complete plaatpakketten.',
    },
  },
  {
    slug: 'aluminium-zetwerk',
    technique: 'zetwerk',
    index: '04',
    name: 'Aluminium zetwerk',
    short: 'Zetwerk',
    label: 'Press Brake Forming',
    tagline: 'Gezette plaatdelen voor machinebouw, constructie en maritiem.',
    intro:
      'CNC-kantwerk van aluminium plaatdelen: beugels, profielen, kasten en afdekkappen. We controleren vooraf de zetvolgorde, buigradii en uitslag, zodat het eindresultaat aansluit op je ontwerp.',
    image: { src: '/images/renders/bracket.webp', alt: 'Illustratieve render van een gezette aluminium beugel met twee zetlijnen, gaten en een uitsparing' },
    highlights: ['CNC-kantwerk', 'Gezette plaatdelen', 'Onderdelen voor machinebouw, constructie en maritieme toepassingen'],
    capabilities: [
      {
        title: 'CNC-kantwerk',
        text: 'Gezette delen op CNC-gestuurde kantbanken, voor herhaalbare hoeken en maatvoering binnen de mogelijkheden van materiaal en ontwerp.',
      },
      {
        title: 'Uitslag en maakbaarheid',
        text: 'Lever je een 3D-model aan, dan controleren we de uitslag, minimale flenslengtes en buigradii. Waar nodig stellen we een kleine aanpassing voor.',
      },
      {
        title: 'Snijden en zetten in één',
        text: 'Snij- en zetwerk uit één hand: de plaat wordt gesneden, ontbraamd en gezet, eventueel aangevuld met inpersmoeren, tappen of lassen.',
      },
      {
        title: 'Maritiem en constructie',
        text: 'Aluminium zetwerk voor beugels, consoles, afdekkappen en constructiedelen, onder meer voor machinebouw en jachtbouw.',
      },
    ],
    specs: [
      { label: 'Bewerking', value: 'CNC-kantwerk van plaatdelen' },
      { label: 'Aantallen', value: 'Enkelstuks, prototypes en series' },
      { label: 'Materialen', value: 'Aluminium; RVS en staal op aanvraag' },
      { label: 'Buigradii', value: 'Afhankelijk van plaatdikte, legering en gereedschap; per aanvraag te bevestigen' },
      { label: 'Aanlevering', value: 'STEP (gevouwen model), DXF-uitslag en/of PDF-tekening' },
      { label: 'Levertijd', value: 'Afhankelijk van aantal en vervolgbewerkingen; vermeld in de offerte' },
    ],
    applications: ['Beugels, consoles en hoekprofielen', 'Kasten, afdekkappen en panelen', 'Constructiedelen', 'Maritieme toepassingen en jachtbouw', 'Machinebouw en installatietechniek'],
    deliverables: [
      '3D-model als STEP (bij voorkeur het gezette model)',
      'PDF-tekening met binnen- of buitenmaten en hoeken',
      'Materiaal, legering en plaatdikte',
      'Aantallen en eventuele vervolgbewerkingen',
    ],
    related: ['aluminium-snijwerk', 'laswerk-samenstellingen', 'cnc-frezen'],
    faq: [
      {
        q: 'Moet ik zelf de uitslag aanleveren?',
        a: 'Niet per se. Met een 3D-model van het gezette onderdeel kan de uitslag worden bepaald. Heb je zelf een uitslag, stuur die dan mee als DXF.',
      },
      {
        q: 'Welke aluminiumlegeringen zijn geschikt om te zetten?',
        a: 'Niet elke legering en hardheid laat zich even goed zetten. We kijken mee naar de combinatie van legering, dikte en buigradius en bevestigen de mogelijkheden per aanvraag.',
      },
    ],
    seo: {
      title: 'Aluminium zetwerk — CNC-kantwerk van plaatdelen',
      description:
        'Aluminium zetwerk en CNC-kantwerk voor machinebouw, constructie en maritieme toepassingen. Snijden en zetten uit één hand. Upload je tekening.',
    },
  },
  {
    slug: 'laswerk-samenstellingen',
    technique: 'laswerk',
    index: '05',
    name: 'Laswerk & samenstellingen',
    short: 'Laswerk',
    label: 'Welding & Assemblies',
    tagline: 'Van losse delen tot complete gelaste constructies.',
    intro:
      'Gelaste constructies en samenstellingen in aluminium, RVS en staal, afhankelijk van de mogelijkheden per opdracht. We brengen snij-, zet-, frees- en laswerk samen tot één onderdeel dat klaar is voor montage.',
    image: { src: '/images/renders/frame.webp', alt: 'Illustratieve render van een gelast frame van kokerprofiel met schetsplaten en lasnaden' },
    highlights: ['Aluminium, RVS en staal, afhankelijk van mogelijkheden', 'TIG, MIG en MAG', 'Complete gelaste constructies en samenstellingen'],
    capabilities: [
      {
        title: 'TIG, MIG en MAG',
        text: 'Het lasproces kiezen we op basis van materiaal, wanddikte, zichtbaarheid van de naad en gewenste afwerking.',
      },
      {
        title: 'Aluminium, RVS en staal',
        text: 'Lassen van aluminium, roestvast staal en constructiestaal, afhankelijk van de mogelijkheden binnen ons netwerk. Per aanvraag bevestigen we wat haalbaar is.',
      },
      {
        title: 'Complete samenstellingen',
        text: 'Gesneden, gezette en verspaande delen samengebracht en gelast tot één constructie. Eén aanvraag, één aanspreekpunt, één levering.',
      },
      {
        title: 'Nabehandeling',
        text: 'Beitsen, stralen, coaten of richten kunnen we meenemen in de offerte. Specifieke eisen aan lasnaden en afwerking leggen we vooraf vast.',
      },
    ],
    specs: [
      { label: 'Processen', value: 'TIG, MIG en MAG' },
      { label: 'Materialen', value: 'Aluminium, RVS en staal, afhankelijk van mogelijkheden' },
      { label: 'Omvang', value: 'Van eenvoudige lasdelen tot complete samenstellingen' },
      { label: 'Kwalificaties', value: 'Specifieke eisen aan lasmethode of documentatie vooraf afstemmen' },
      { label: 'Aanlevering', value: `${commonFormats}; bij voorkeur met samenstellingstekening en lassymbolen` },
      { label: 'Levertijd', value: 'Afhankelijk van omvang en vervolgbewerkingen; vermeld in de offerte' },
    ],
    applications: ['Machineframes en onderstellen', 'Consoles, steunen en bordessen', 'RVS-constructies', 'Aluminium constructies voor maritieme toepassingen', 'Samenstellingen voor de machinebouw'],
    deliverables: [
      'Samenstellingstekening (PDF) met lassymbolen en hoofdmaten',
      '3D-model van de samenstelling als STEP, indien beschikbaar',
      'Materialen en eventuele nabehandeling',
      'Eisen aan lasnaden, kwalificaties of documentatie',
    ],
    related: ['aluminium-snijwerk', 'aluminium-zetwerk', 'cnc-frezen'],
    faq: [
      {
        q: 'Kunnen jullie gecertificeerd laswerk leveren?',
        a: 'Als je project specifieke eisen stelt aan lasmethodes, kwalificaties of documentatie, geef dat dan aan in je aanvraag. We bevestigen per opdracht wat we kunnen leveren en doen geen toezeggingen die we niet kunnen onderbouwen.',
      },
      {
        q: 'Wat bedoelen jullie met een complete samenstelling?',
        a: 'Een constructie die bestaat uit meerdere onderdelen en bewerkingen, bijvoorbeeld gesneden en gezette plaat, gefreesde blokken en gelaste verbindingen, die wij als één geheel organiseren en leveren.',
      },
    ],
    seo: {
      title: 'Laswerk & samenstellingen — TIG, MIG en MAG',
      description:
        'Gelaste constructies en complete samenstellingen in aluminium, RVS en staal. TIG, MIG en MAG, met één aanspreekpunt voor alle bewerkingen. Vraag een offerte aan.',
    },
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
