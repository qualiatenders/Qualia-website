import Link from 'next/link';
import { GeoArt } from '@/components/GeoArt';
import { categories } from '@/lib/taxonomy';

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 opacity-50">
        <GeoArt visual="contours" seed="404" className="size-full" />
      </div>
      <div className="shell relative">
        <p className="meta text-red-ink">Error 404 · Coordinates not found</p>
        <h1 className="mt-6 font-display text-[clamp(4rem,2rem+12vw,13rem)] leading-[0.8] font-semibold tracking-[-0.02em]">Off the map.</h1>
        <p className="mt-8 max-w-xl text-lead text-fog">This page doesn’t exist, or it has moved. Try a search, or head back to the latest news.</p>
        <form role="search" action="/search/" className="mt-10 flex max-w-xl border border-white/25 focus-within:border-white">
          <label htmlFor="nf-q" className="sr-only">
            Search
          </label>
          <input id="nf-q" name="q" type="search" placeholder="Search GeoInformatics" className="min-w-0 flex-1 bg-transparent px-5 py-4 placeholder:text-white focus:outline-none" />
          <button className="btn btn-light min-h-0">Search</button>
        </form>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-red">
            Back to the homepage
          </Link>
          <Link href="/latest/" className="btn btn-outline border-white/25">
            Latest news
          </Link>
        </div>
        <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fog">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={c.path} className="hover:text-white">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
