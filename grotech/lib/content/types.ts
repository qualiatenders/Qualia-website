export type TechniqueId = 'frezen' | 'draaien' | 'snijwerk' | 'zetwerk' | 'laswerk' | 'samenstelling';

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  technique: TechniqueId;
  index: string;
  name: string;
  /** Korte naam voor navigatie en kaarten */
  short: string;
  /** Engelse vaklabel, past bij de tweetalige vormtaal van het merk */
  label: string;
  tagline: string;
  intro: string;
  image: { src: string; alt: string };
  highlights: string[];
  capabilities: { title: string; text: string }[];
  specs: { label: string; value: string }[];
  applications: string[];
  deliverables: string[];
  related: string[];
  faq: Faq[];
  seo: { title: string; description: string };
};

export type Material = {
  id: string;
  name: string;
  symbol: string;
  summary: string;
  properties: string[];
  examples: string;
  applications: string[];
  techniques: Partial<Record<TechniqueId, 'ja' | 'aanvraag'>>;
  note?: string;
};
