import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { legalDoc, legalDocs } from '@/lib/legal';
import { pageMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/format';
import { PageHero } from '@/components/PageHero';

export const generateStaticParams = async () => legalDocs().map((d) => ({ slug: d.slug }));
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = legalDoc((await params).slug);
  return d ? pageMetadata({ title: d.title, description: d.intro, path: `/legal/${d.slug}/` }) : {};
}

export default async function LegalPage({ params }: Props) {
  const d = legalDoc((await params).slug);
  if (!d) notFound();
  return (
    <>
      <PageHero kicker="Legal" title={d.title} intro={d.intro} crumbs={[{ name: 'Home', path: '/' }, { name: d.title, path: `/legal/${d.slug}/` }]} />
      <section className="surface-white py-14 lg:py-20">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <nav aria-label="Legal" className="lg:col-span-3">
            <ul className="space-y-1 lg:sticky lg:top-[calc(var(--header-total)+2rem)]">
              {legalDocs().map((x) => (
                <li key={x.slug}>
                  <Link href={`/legal/${x.slug}/`} aria-current={x.slug === d.slug ? 'page' : undefined} className={`block border-l-2 py-2 pl-4 ${x.slug === d.slug ? 'border-red font-semibold' : 'border-transparent text-fg-muted hover:text-fg'}`}>
                    {x.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <article className="legal-body article-body max-w-[44rem] lg:col-span-8 lg:col-start-5">
            <p className="meta">Last updated {formatDate(d.updated)}</p>
            {d.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
