import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Subscription confirmed', robots: { index: false } };

/** Landing page for the double opt-in confirmation link. */
export default function Confirmed() {
  return (
    <section className="surface-paper py-24 lg:py-36">
      <div className="shell max-w-3xl">
        <p className="kicker text-accent">Newsletter</p>
        <h1 className="mt-4 font-display text-h1 leading-none font-semibold tracking-[-0.02em]">You’re in. Welcome to GeoInformatics.</h1>
        <p className="mt-6 text-lead text-fg-muted">Your subscription is confirmed. The next edition will arrive in your inbox — add our sender address to your contacts so it doesn’t end up in spam.</p>
        <Link href="/" className="btn btn-dark mt-10">
          Read today’s news →
        </Link>
      </div>
    </section>
  );
}
