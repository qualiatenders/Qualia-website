import type { Material } from '../types';

/**
 * Materiaaloverzicht. Snij-, zet- en laswerk uitsluitend in aluminium;
 * CNC-verspaning (frezen en draaien) in alle materialen. Genoemde kwaliteiten zijn voorbeelden van veelgevraagde
 * soorten — beschikbaarheid en geschiktheid worden altijd per aanvraag bevestigd.
 * 'ja' = gangbare combinatie, 'aanvraag' = mogelijk, per opdracht te bevestigen.
 */
export const materials: Material[] = [
  {
    id: 'aluminium',
    name: 'Aluminium',
    symbol: 'Al',
    summary: 'Onze specialiteit. Licht, goed verspaanbaar en corrosiebestendig: we snijden, zetten, lassen en verspanen het.',
    properties: ['Laag gewicht', 'Goed verspaanbaar', 'Natuurlijke corrosiebestendigheid', 'Geschikt voor anodiseren'],
    examples: 'Veelgevraagd zijn onder meer 5083, 6060, 6082 en 7075.',
    applications: ['Machinebouw', 'Behuizingen', 'Maritiem en jachtbouw', 'Constructiedelen'],
    techniques: { frezen: 'ja', draaien: 'ja', snijwerk: 'ja', zetwerk: 'ja', laswerk: 'ja', samenstelling: 'ja' },
  },
  {
    id: 'rvs',
    name: 'RVS',
    symbol: 'Cr-Ni',
    summary: 'Roestvast staal voor toepassingen waar corrosiebestendigheid, hygiëne of duurzaamheid voorop staan.',
    properties: ['Corrosiebestendig', 'Hoge sterkte', 'Hygiënisch', 'Taai bij verspanen'],
    examples: 'Veelgevraagd zijn onder meer 304 (1.4301) en 316 (1.4401/1.4404).',
    applications: ['Voedingsmiddelen- en procesindustrie', 'Maritiem', 'Afsluiters en koppelingen', 'Constructies'],
    techniques: { frezen: 'ja', draaien: 'ja' },
  },
  {
    id: 'staal',
    name: 'Staal',
    symbol: 'Fe',
    summary: 'Constructie- en machinestaal voor onderdelen die sterkte, stijfheid en slijtvastheid vragen.',
    properties: ['Hoge sterkte en stijfheid', 'Goed lasbaar (afhankelijk van kwaliteit)', 'Te harden of te veredelen', 'Vraagt meestal een oppervlaktebescherming'],
    examples: 'Veelgevraagd zijn onder meer S235, S355, C45 en 42CrMo4.',
    applications: ['Machineframes', 'Assen en tandwielen', 'Constructiedelen', 'Opspanmiddelen'],
    techniques: { frezen: 'ja', draaien: 'ja' },
  },
  {
    id: 'messing',
    name: 'Messing',
    symbol: 'Cu-Zn',
    summary: 'Uitstekend verspaanbaar en goed geleidend. Vaak gebruikt voor draaidelen, fittingen en decoratieve onderdelen.',
    properties: ['Zeer goed verspaanbaar', 'Elektrisch en thermisch geleidend', 'Corrosiebestendig', 'Fraaie afwerking'],
    examples: 'Bijvoorbeeld CW614N; geschikte kwaliteit afhankelijk van toepassing.',
    applications: ['Fittingen en koppelingen', 'Bussen en inzetstukken', 'Elektrotechniek', 'Instrumentatie'],
    techniques: { frezen: 'ja', draaien: 'ja' },
  },
  {
    id: 'koper',
    name: 'Koper',
    symbol: 'Cu',
    summary: 'Hoogste elektrische en thermische geleiding van de gangbare technische metalen.',
    properties: ['Uitstekende elektrische geleiding', 'Uitstekende warmtegeleiding', 'Zacht, vraagt specifieke verspaning'],
    examples: 'Bijvoorbeeld Cu-ETP of Cu-OF, afhankelijk van toepassing.',
    applications: ['Stroomrails en contacten', 'Koellichamen', 'Elektrotechnische componenten'],
    techniques: { frezen: 'ja', draaien: 'ja' },
  },
  {
    id: 'kunststof',
    name: 'Technische kunststoffen',
    symbol: 'POM · PA · PE',
    summary: 'Lichte, slijtvaste en elektrisch isolerende onderdelen, vaak als vervanger van metaal waar dat functioneel kan.',
    properties: ['Laag gewicht', 'Slijtvast en zelfsmerend (afhankelijk van type)', 'Elektrisch isolerend', 'Chemisch bestendig (afhankelijk van type)'],
    examples: 'Veelgevraagd zijn onder meer POM, PA, PE-HMW/UHMW en PEEK.',
    applications: ['Glijlagers en slijtstrips', 'Geleiders en tandwielen', 'Isolatoren', 'Voedingsmiddelentoepassingen'],
    techniques: { frezen: 'ja', draaien: 'ja' },
    note: 'Kunststoffen gedragen zich anders dan metaal bij verspanen en temperatuur. Toleranties beoordelen we per materiaal.',
  },
];
