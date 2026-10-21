'use client';

import Link from 'next/link';
import { useState } from 'react';
import { contactTopics, type ContactTopic } from '@/lib/forms';
import { useFormToken } from './useFormToken';
import { Field, FormStatus, Sent } from './Field';
import { Icon } from '../Icon';

type State = { status: 'idle' | 'sending' | 'sent' | 'error'; message?: string; fields?: Record<string, string>; delivered?: boolean };

export function ContactForm({ initialTopic = 'editorial' }: { initialTopic?: ContactTopic }) {
  const token = useFormToken('contact');
  const [state, setState] = useState<State>({ status: 'idle' });
  const err = state.fields ?? {};

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ status: 'sending' });
    const res = await fetch('/api/contact/?kind=contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...Object.fromEntries(f), consent: f.get('consent') === 'on', token }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as State & { ok?: boolean; error?: string } | null;
    if (res?.ok && data?.ok) setState({ status: 'sent', delivered: data.delivered });
    else setState({ status: 'error', message: data?.error ?? 'Could not send your message. Please try again.', fields: data?.fields });
  }

  if (state.status === 'sent') return <Sent title="Thank you — message received." body="Our team reads every message and will reply by email if a response is needed." />;

  const a = (k: string) => ({ 'aria-invalid': err[k] ? true : undefined, 'aria-describedby': err[k] ? `c-${k}-error` : undefined });
  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      <Field id="c-topic" label="What is it about?">
        <select id="c-topic" name="topic" defaultValue={initialTopic} className="field">
          {Object.entries(contactTopics).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={err.name}>
          <input id="c-name" name="name" required autoComplete="name" className="field" {...a('name')} />
        </Field>
        <Field id="c-email" label="Email" error={err.email}>
          <input id="c-email" name="email" type="email" required autoComplete="email" className="field" {...a('email')} />
        </Field>
      </div>
      <Field id="c-organization" label="Organization" optional>
        <input id="c-organization" name="organization" autoComplete="organization" className="field" />
      </Field>
      <Field id="c-message" label="Message" error={err.message} hint="For press releases, paste the text or a link. For events, include dates, location and the official website.">
        <textarea id="c-message" name="message" required rows={7} className="field" {...a('message')} />
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 text-sm text-fg-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 flex-none accent-red" {...a('consent')} />
        <span>
          I agree that GeoInformatics processes my details to handle this message, as described in the{' '}
          <Link href="/legal/privacy/" className="underline underline-offset-2">
            privacy policy
          </Link>
          .{err.consent && <span className="mt-1 block font-medium text-accent">{err.consent}</span>}
        </span>
      </label>
      <FormStatus state={state} />
      <div>
        <button type="submit" disabled={state.status === 'sending' || !token} className="group btn btn-dark min-h-13 px-7">
          {state.status === 'sending' ? 'Sending…' : 'Send message'} <Icon name="arrow" className="arrow size-4" />
        </button>
      </div>
    </form>
  );
}
