'use client';

import Link from 'next/link';
import { useState } from 'react';
import { budgetLabels } from '@/lib/forms';
import { useFormToken } from './useFormToken';
import { Field, FormStatus, Sent } from './Field';
import { Icon } from '../Icon';

type State = { status: 'idle' | 'sending' | 'sent' | 'error'; message?: string; fields?: Record<string, string> };

/** Advertiser enquiry. Interests list = placements plus non-display formats. */
export function AdvertiseForm({ interests }: { interests: { id: string; label: string }[] }) {
  const token = useFormToken('advertise');
  const [state, setState] = useState<State>({ status: 'idle' });
  const err = state.fields ?? {};

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ status: 'sending' });
    const payload = { ...Object.fromEntries(f), interests: f.getAll('interests'), consent: f.get('consent') === 'on', token };
    const res = await fetch('/api/contact/?kind=advertise', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as (State & { ok?: boolean; error?: string }) | null;
    if (res?.ok && data?.ok) setState({ status: 'sent' });
    else setState({ status: 'error', message: data?.error ?? 'Could not send your request. Please try again.', fields: data?.fields });
  }

  if (state.status === 'sent') return <Sent title="Request received." body="Our partnerships team will come back to you with availability and a tailored proposal." />;

  const a = (k: string) => ({ 'aria-invalid': err[k] ? true : undefined, 'aria-describedby': err[k] ? `ad-${k}-error` : undefined });
  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="ad-name" label="Name" error={err.name}>
          <input id="ad-name" name="name" required autoComplete="name" className="field" {...a('name')} />
        </Field>
        <Field id="ad-email" label="Work email" error={err.email}>
          <input id="ad-email" name="email" type="email" required autoComplete="email" className="field" {...a('email')} />
        </Field>
        <Field id="ad-company" label="Company" error={err.company}>
          <input id="ad-company" name="company" required autoComplete="organization" className="field" {...a('company')} />
        </Field>
        <Field id="ad-role" label="Role" optional>
          <input id="ad-role" name="role" autoComplete="organization-title" className="field" />
        </Field>
      </div>
      <fieldset>
        <legend className="label">Interested in</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {interests.map((i) => (
            <label key={i.id} className="flex cursor-pointer items-center gap-3 border border-line-strong bg-surface-raised px-3 py-2.5 text-sm transition-colors has-checked:border-red">
              <input type="checkbox" name="interests" value={i.id} className="size-4 accent-red" />
              {i.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="ad-budget" label="Indicative budget" optional>
          <select id="ad-budget" name="budget" className="field" defaultValue="">
            {Object.entries(budgetLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {k === '' ? 'Select…' : v}
              </option>
            ))}
          </select>
        </Field>
        <Field id="ad-timing" label="Campaign timing" optional>
          <input id="ad-timing" name="timing" placeholder="e.g. Q2, around a product launch" className="field" />
        </Field>
      </div>
      <Field id="ad-message" label="Anything else we should know?" optional>
        <textarea id="ad-message" name="message" rows={5} className="field" />
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 text-sm text-fg-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 flex-none accent-red" {...a('consent')} />
        <span>
          I agree that GeoInformatics uses these details to respond to my request (
          <Link href="/legal/privacy/" className="underline underline-offset-2">
            privacy policy
          </Link>
          ).{err.consent && <span className="mt-1 block font-medium text-accent">{err.consent}</span>}
        </span>
      </label>
      <FormStatus state={state} />
      <div>
        <button type="submit" disabled={state.status === 'sending' || !token} className="group btn btn-red min-h-14 px-8 text-base">
          {state.status === 'sending' ? 'Sending…' : 'Request a proposal'} <Icon name="arrow" className="arrow size-4" />
        </button>
      </div>
    </form>
  );
}
