'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Field, Honeypot, inputClass, describedBy } from './Field';
import { useFormToken } from './useFormToken';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { contactSchema, fieldErrors } from '@/lib/quote/schema';
import { href } from '@/lib/i18n/routes';

const empty = { name: '', company: '', email: '', phone: '', subject: '', message: '', privacy: false };

export function ContactForm() {
  const [v, setV] = useState(empty);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const { token, refresh } = useFormToken('contact');

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setV((p) => ({ ...p, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(v);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      document.getElementById(`c-${Object.keys(fe)[0]}`)?.focus();
      return;
    }
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ payload: parsed.data, token, website: hp }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        if (String(data.code ?? '').startsWith('token')) refresh();
        setMessage(data.error ?? 'Versturen is niet gelukt. Probeer het opnieuw.');
        setState('error');
        return;
      }
      setReference(data.reference ?? '');
      setState('done');
    } catch {
      setMessage('Geen verbinding. Controleer je internetverbinding en probeer het opnieuw.');
      setState('error');
    }
  }

  if (state === 'done')
    return (
      <div className="rounded-md border border-line bg-charcoal/60 p-8 md:p-10" role="status" aria-live="polite">
        <span className="grid size-12 place-items-center rounded-full bg-red text-black"><Icon name="check" size={22} strokeWidth={2.4} /></span>
        <h2 className="mt-6 text-2xl font-black text-offwhite">Bericht ontvangen</h2>
        <p className="mt-3 text-mist">Bedankt, {v.name.split(' ')[0]}. We nemen zo snel mogelijk contact met je op.{reference && <> Referentie: <span className="font-mono text-offwhite">{reference}</span>.</>}</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="relative space-y-6" aria-describedby="contact-required">
      <Honeypot value={hp} onChange={setHp} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="c-name" label="Naam" required error={errors.name}>
          <input id="c-name" className={inputClass} autoComplete="name" value={v.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('c-name', errors.name)} required />
        </Field>
        <Field id="c-company" label="Bedrijf" optional error={errors.company}>
          <input id="c-company" className={inputClass} autoComplete="organization" value={v.company} onChange={set('company')} />
        </Field>
        <Field id="c-email" label="E-mailadres" required error={errors.email}>
          <input id="c-email" type="email" inputMode="email" className={inputClass} autoComplete="email" value={v.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('c-email', errors.email)} required />
        </Field>
        <Field id="c-phone" label="Telefoon" optional error={errors.phone}>
          <input id="c-phone" type="tel" inputMode="tel" className={inputClass} autoComplete="tel" value={v.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('c-phone', errors.phone)} />
        </Field>
      </div>
      <Field id="c-subject" label="Onderwerp" optional error={errors.subject}>
        <input id="c-subject" className={inputClass} value={v.subject} onChange={set('subject')} />
      </Field>
      <Field id="c-message" label="Bericht" required error={errors.message}>
        <textarea id="c-message" rows={6} className={`${inputClass} resize-y`} value={v.message} onChange={set('message')} aria-invalid={Boolean(errors.message)} aria-describedby={describedBy('c-message', errors.message)} required />
      </Field>
      <div>
        <label className="flex cursor-pointer gap-3 text-[0.9375rem] text-mist">
          <input id="c-privacy" type="checkbox" checked={v.privacy} onChange={set('privacy')} className="mt-1 size-5 shrink-0 accent-[#F10A1D]" aria-invalid={Boolean(errors.privacy)} aria-describedby={describedBy('c-privacy', errors.privacy)} />
          <span>Ik ga akkoord dat GROTECH mijn gegevens gebruikt om op mijn bericht te reageren, zoals beschreven in de <Link href={href('privacy')} className="text-offwhite underline decoration-red underline-offset-4">privacyverklaring</Link>.</span>
        </label>
        {errors.privacy && <p id="c-privacy-error" className="mt-2 text-[0.8125rem] font-bold text-error" role="alert">{errors.privacy}</p>}
      </div>
      {state === 'error' && message && (
        <p className="flex gap-3 rounded-[3px] border border-red/50 bg-red/[0.08] p-4 text-[0.9375rem] text-offwhite" role="alert">
          <Icon name="alert" size={20} className="shrink-0 text-red" /> {message}
        </p>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="contact-required" className="text-[0.8125rem] text-muted"><span className="text-red">*</span> Verplicht veld</p>
        <Button type="submit" size="lg" disabled={state === 'sending'} icon={state === 'sending' ? null : 'arrow-right'}>
          {state === 'sending' ? 'Versturen…' : 'Bericht versturen'}
        </Button>
      </div>
    </form>
  );
}
