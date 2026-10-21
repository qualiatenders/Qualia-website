import { site } from './site';

/**
 * Legal texts. They describe how this platform actually works (what is
 * stored, which cookies exist, how ads are measured). They are a starting
 * point for review by the publisher's legal adviser, not legal advice.
 */
export type LegalDoc = { slug: string; title: string; intro: string; updated: string; sections: { h: string; p: string[] }[] };

const publisher = () => site.publisher.legalName || 'the publisher of GeoInformatics';
const contact = () => (site.email.editorial ? ` at ${site.email.editorial}` : ' via the contact page');

export const legalDocs = (): LegalDoc[] => [
  {
    slug: 'privacy',
    title: 'Privacy policy',
    updated: '2026-10-21',
    intro: `This policy explains which personal data GeoInformatics processes, why, and what your rights are. The controller is ${publisher()}.`,
    sections: [
      {
        h: 'Reading the site',
        p: [
          'You can read GeoInformatics without creating an account and without being tracked across websites. We do not use advertising cookies, tracking pixels or third-party ad networks.',
          'To protect the site against abuse, our server briefly processes your IP address. For rate limiting it is converted into a keyed hash held in memory only; it is not stored in a database.',
          'If cookieless analytics are enabled, we count page visits in aggregate without cookies and without identifying you.',
        ],
      },
      {
        h: 'Measuring articles and advertisements',
        p: [
          'To rank our “Most read” list we count anonymous article views. To report to advertisers we count, per advertisement, how often it was displayed, how often it was visible on screen, and how often it was clicked, together with a device category (desktop, tablet or mobile).',
          'These counts contain no identifiers, are not linked to you, and are stored only as daily totals.',
        ],
      },
      {
        h: 'Newsletter',
        p: [
          'If you subscribe, we process your email address to send you the newsletter. Your subscription only starts after you confirm it through the link we email you (double opt-in). Our email service provider processes your address on our behalf under a data processing agreement.',
          'Every newsletter contains an unsubscribe link. After you unsubscribe, we stop sending and keep only what is necessary to respect your choice.',
        ],
      },
      {
        h: 'Contact and advertising enquiries',
        p: [
          'When you use the contact or advertising form we process the details you provide to handle your message. We keep enquiries for up to 24 months, unless they lead to an agreement that requires longer retention.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          `You have the right to access, correct and delete your personal data, to object to and restrict processing, and to data portability. Contact us${contact()}. You may also lodge a complaint with your data protection authority.`,
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie policy',
    updated: '2026-10-21',
    intro: 'GeoInformatics is built to work without tracking cookies.',
    sections: [
      {
        h: 'Cookies we use',
        p: [
          'The public site sets no cookies. Advertisements are served from our own platform and measured without cookies or device identifiers, and the optional analytics we use are cookieless.',
        ],
      },
      {
        h: 'Third-party content',
        p: [
          'Some articles embed videos. These are loaded from privacy-enhanced domains where available (such as youtube-nocookie.com). The provider may set its own cookies once you play a video.',
          'Should we ever add services that require consent, we will ask for it before they load and update this policy.',
        ],
      },
    ],
  },
  {
    slug: 'advertising-disclosure',
    title: 'Advertising disclosure',
    updated: '2026-10-21',
    intro: 'How we keep advertising and journalism apart.',
    sections: [
      {
        h: 'Display advertising',
        p: ['Display advertisements are labelled “Advertisement”. They are sold directly by GeoInformatics and served from our own platform. Advertisers have no influence on editorial decisions.'],
      },
      {
        h: 'Sponsored content',
        p: [
          'Articles paid for by a partner are labelled “Sponsored”, “Advertisement” or “Partner content” above the headline and in every listing, and name the sponsor. They are not written by the GeoInformatics newsroom and are excluded from our Google News sitemap.',
          'Links in sponsored content and advertisements carry the rel="sponsored" attribute.',
        ],
      },
      {
        h: 'Newsletter and events',
        p: ['Sponsored sections in the newsletter and promoted event listings are labelled as such.'],
      },
    ],
  },
  {
    slug: 'editorial-standards',
    title: 'Editorial standards',
    updated: '2026-10-21',
    intro: 'The principles our newsroom works by.',
    sections: [
      { h: 'Independence', p: ['Editors decide what we publish. Commercial partners, advertisers and sources do not review or approve stories before publication.'] },
      { h: 'Accuracy and sourcing', p: ['We verify claims, attribute information to its source and link to originals where possible. Press releases are identified as the source when we use them.'] },
      { h: 'Corrections', p: [`When we make a mistake we correct it promptly and note the correction in the article. Report an error${contact()}.`] },
      { h: 'Updates', p: ['Articles show both their publication date and the date of the last substantive update.'] },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    updated: '2026-10-21',
    intro: 'The conditions for using GeoInformatics.',
    sections: [
      { h: 'Content', p: [`All content on GeoInformatics is protected by copyright and belongs to ${publisher()} or its contributors. You may share links and short quotations with attribution. Republishing full articles requires written permission.`] },
      { h: 'No professional advice', p: ['Our reporting is for information. It is not technical, legal or investment advice.'] },
      { h: 'External links', p: ['We link to external websites for reference. We are not responsible for their content.'] },
    ],
  },
];

export const legalDoc = (slug: string) => legalDocs().find((d) => d.slug === slug);
