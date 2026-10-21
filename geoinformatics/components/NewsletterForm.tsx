'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './Icon';

type State = { status: 'idle' | 'sending' } | { status: 'done'; pending: boolean } | { status: 'error'; message: string };

/**
 * Newsletter sign-up. Double opt-in: the provider sends a confirmation email
 * and the address is only added once the subscriber clicks it.
 */
export function NewsletterForm({ source, variant = 'dark', size = 'md' }: { source: string; variant?: 'dark' | 'light'; size?: 'md' | 'lg' }) {
  const [state, setState] = useState<State>({ status: 'idle' });
  const id = useId();
  const dark = variant === 'dark';

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ status: 'sending' });
    try {
      const res = await fetch('/api/newsletter/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), consent: form.get('consent') === 'on', website: form.get('website'), source }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; pending?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setState({ status: 'done', pending: data.pending !== false });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    }
  }

  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === 'done' ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 border-l-2 border-red py-2 pl-5 ${dark ? 'text-white' : 'text-ink'}`}>
            <Icon name="check" className="mt-0.5 size-6 flex-none text-red" />
            <div>
              <p className="font-display text-xl font-semibold">{state.pending ? 'Check your inbox.' : 'You are subscribed.'}</p>
              <p className={`mt-1 text-sm ${dark ? 'text-fog' : 'text-stone'}`}>
                {state.pending ? 'We have sent you a confirmation link. Your subscription starts once you click it.' : 'The next edition will land in your inbox.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0, y: -6 }} onSubmit={submit} noValidate={false} className="w-full">
            <div className={`flex flex-col gap-3 sm:flex-row sm:gap-0 ${size === 'lg' ? 'sm:h-16' : 'sm:h-13'}`}>
              <label htmlFor={`${id}-email`} className="sr-only">
                Email address
              </label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Your work email"
                className={`min-h-13 min-w-0 flex-1 border px-4 text-base transition-colors focus:outline-none sm:border-r-0 ${size === 'lg' ? 'lg:px-6 lg:text-lg' : ''} ${
                  dark ? 'border-white/25 bg-white/5 text-white placeholder:text-white/45 focus:border-white' : 'border-ink/25 bg-white text-ink placeholder:text-stone focus:border-ink'
                }`}
              />
              <button type="submit" disabled={state.status === 'sending'} className={`btn btn-red min-h-13 flex-none sm:h-full ${size === 'lg' ? 'px-8 text-base' : ''}`}>
                {state.status === 'sending' ? 'Subscribing…' : 'Subscribe'}
                <Icon name="arrow" className="arrow size-4" />
              </button>
            </div>
            {/* Honeypot: invisible to people, tempting to bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
              <label>
                Website <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className={`mt-4 flex items-start gap-3 text-[0.8125rem] leading-snug ${dark ? 'text-fog' : 'text-stone'}`}>
              <input name="consent" type="checkbox" required className="mt-0.5 size-4 flex-none accent-red" />
              <span>
                I agree to receive the GeoInformatics newsletter and accept the{' '}
                <Link href="/legal/privacy/" className="underline underline-offset-2 hover:text-current">
                  privacy policy
                </Link>
                . Unsubscribe any time.
              </span>
            </label>
            {state.status === 'error' && (
              <p role="alert" className={`mt-3 text-sm font-medium ${dark ? 'text-red-ink' : 'text-red'}`}>
                {state.message}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
