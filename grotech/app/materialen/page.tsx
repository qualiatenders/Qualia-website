import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { CtaBand } from '@/components/CtaBand';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { materials } from '@/lib/content/nl/materials';
import { services } from '@/lib/content/nl/services';
import { techniques } from '@/lib/quote/options';
import { href, quoteHref, serviceHref } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Materialen',
  description: 'Aluminium, RVS, staal, messing, koper en technische kunststoffen: eigenschappen, toepassingen en geschikte bewerkingen. Kwaliteiten bevestigen we per aanvraag.',
  path: href('materials'),
});

const cols = techniques.filter((t) => t.id !== 'samenstelling');

export default function MaterialsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Home', path: '/' }, { name: 'Materialen', path: href('materials') }]}
        eyebrow="Materialen"
        title={<>Materiaal is de hoofdrolspeler<span className="text-red">.</span></>}
        lead="De juiste materiaalkeuze bepaalt functie, bewerkbaarheid en prijs. Hieronder vind je de materialen waar we mee werken, met hun eigenschappen en gangbare toepassingen. Specifieke kwaliteiten en beschikbaarheid bevestigen we altijd per aanvraag."
        actions={<ButtonLink href={quoteHref()} size="lg" icon="upload">Offerte aanvragen</ButtonLink>}
      >
        <nav aria-label="Materialen op deze pagina" className="mt-10 flex flex-wrap gap-2" data-reveal>
          {materials.map((m) => (
            <a key={m.id} href={`#${m.id}`} className="rounded-full border border-line-strong px-4 py-2 text-sm font-bold text-mist transition-colors hover:border-offwhite/50 hover:text-offwhite">
              {m.name}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="py-16 md:py-24" aria-label="Materiaaloverzicht">
        <div className="container-x space-y-6">
          {materials.map((m, i) => (
            <article id={m.id} key={m.id} className="grid scroll-mt-28 overflow-hidden rounded-md border border-line bg-charcoal/40 lg:grid-cols-12" data-reveal>
              <div className="relative flex flex-col justify-between border-b border-line bg-black p-7 lg:col-span-3 lg:border-r lg:border-b-0 md:p-9">
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')} / {String(materials.length).padStart(2, '0')}</span>
                <span className="mt-8 block text-6xl leading-none font-black tracking-tight text-offwhite md:text-7xl">{m.symbol.split(' ')[0]}</span>
                <span className="mt-3 block font-mono text-xs text-muted">{m.symbol}</span>
                <span className="absolute top-0 left-0 h-full w-0.5 bg-red" aria-hidden="true" />
              </div>
              <div className="grid gap-8 p-7 md:grid-cols-2 md:p-9 lg:col-span-9">
                <div>
                  <h2 className="text-3xl font-black text-offwhite">{m.name}</h2>
                  <p className="mt-4 text-mist">{m.summary}</p>
                  <p className="mt-4 text-[0.9375rem] text-muted">{m.examples} Beschikbaarheid bevestigen we per aanvraag.</p>
                  {m.note && <p className="mt-4 flex gap-2.5 text-[0.875rem] text-muted"><Icon name="info" size={17} className="mt-0.5 shrink-0 text-red" />{m.note}</p>}
                </div>
                <div className="space-y-7">
                  <div>
                    <h3 className="label-caps text-muted">Eigenschappen</h3>
                    <ul className="mt-3 space-y-1.5">
                      {m.properties.map((p) => (
                        <li key={p} className="flex gap-2.5 text-[0.9375rem] text-mist"><span className="mt-[0.6rem] h-0.5 w-2.5 shrink-0 bg-red" aria-hidden="true" />{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="label-caps text-muted">Toepassingen</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {m.applications.map((a) => <li key={a} className="rounded-full border border-line-strong px-3 py-1 text-sm text-mist">{a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="label-caps text-muted">Bewerkingen</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {cols.filter((t) => m.techniques[t.id]).map((t) => {
                        const svc = services.find((s) => s.technique === t.id);
                        return (
                          <li key={t.id}>
                            <Link href={svc ? serviceHref(svc.slug) : href('services')} className="inline-flex items-center gap-2 rounded-[3px] bg-graphite px-3 py-1.5 text-sm font-bold text-offwhite transition-colors hover:bg-steel">
                              {t.label}
                              {m.techniques[t.id] === 'aanvraag' && <span className="font-normal text-muted">· op aanvraag</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-charcoal/40 py-20 md:py-28" aria-labelledby="matrix-title">
        <div className="container-x">
          <p className="eyebrow" data-reveal>Overzicht</p>
          <h2 id="matrix-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite" data-reveal>Materiaal × techniek</h2>
          <p className="mt-5 max-w-2xl text-mist" data-reveal>Een indicatie van gangbare combinaties. De uiteindelijke haalbaarheid hangt af van kwaliteit, afmetingen, dikte en eisen — die bevestigen we per aanvraag.</p>
          <div className="relative mt-10 max-w-full overflow-x-auto rounded-md border border-line" data-reveal tabIndex={0} role="region" aria-label="Tabel materiaal × techniek (horizontaal scrollbaar)">
            <table className="w-full min-w-[42rem] border-collapse text-left text-[0.9375rem]">
              <caption className="sr-only">Gangbare combinaties van materiaal en productietechniek</caption>
              <thead>
                <tr className="bg-black">
                  <th scope="col" className="label-caps p-4 text-muted">Materiaal</th>
                  {cols.map((t) => <th key={t.id} scope="col" className="label-caps p-4 text-center text-muted">{t.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id} className="border-t border-line">
                    <th scope="row" className="p-4 font-bold text-offwhite">{m.name}</th>
                    {cols.map((t) => {
                      const v = m.techniques[t.id];
                      return (
                        <td key={t.id} className="p-4 text-center">
                          {v === 'ja' ? (
                            <span className="inline-flex items-center gap-1.5 text-offwhite"><span className="size-2.5 rounded-full bg-red" aria-hidden="true" /><span className="sr-only">Gangbaar</span></span>
                          ) : v === 'aanvraag' ? (
                            <span className="text-sm text-muted">Op aanvraag</span>
                          ) : (
                            <span className="text-line-strong" aria-label="Niet gebruikelijk">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 flex items-center gap-3 text-sm text-muted"><span className="size-2.5 rounded-full bg-red" aria-hidden="true" /> Gangbare combinatie <span className="ml-4">Op aanvraag = per opdracht te bevestigen</span></p>
        </div>
      </section>
      <CtaBand title="Twijfel je over het materiaal?" text="Kies in de aanvraag ‘Anders / weet ik nog niet’ en beschrijf de toepassing. We denken mee over een passend materiaal." />
    </>
  );
}
