import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Next schrijft dit bij een statische export weg als /robots.txt.
 *
 * Alles mag gecrawld worden — CSS en JS uitdrukkelijk ook, want zonder die
 * bestanden kan Google de pagina niet renderen en beoordelen. Alleen de
 * bedankpagina blijft buiten de index; die staat ook op noindex.
 *
 * De AI-zoekmachines staan er met naam bij. Technisch is dat niet nodig —
 * User-agent: * dekt ze al — maar het maakt zichtbaar dat ze welkom zijn, en
 * het voorkomt dat een later toegevoegde blokkade ze per ongeluk meeneemt.
 * Dit zijn de bots die pagina's ophalen om antwoorden mee te onderbouwen:
 *
 *   OAI-SearchBot   ChatGPT search
 *   ChatGPT-User    een gebruiker die in ChatGPT op een link klikt
 *   PerplexityBot   Perplexity
 *   ClaudeBot       Claude
 *   Google-Extended Gemini en AI Overviews
 *
 * GPTBot staat er bewust NIET bij: die haalt materiaal op om modellen mee te
 * trainen, niet om naar je te verwijzen. Wil je dat wel, voeg hem dan toe.
 */
export const dynamic = 'force-static';

const AI_ZOEKBOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/bedankt/'] },
      ...AI_ZOEKBOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/bedankt/'] })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
