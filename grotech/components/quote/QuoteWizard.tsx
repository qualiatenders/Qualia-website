'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../Icon';
import { Button, ButtonLink } from '../Button';
import { Field, Honeypot, inputClass, describedBy } from '../forms/Field';
import { useFormToken } from '../forms/useFormToken';
import { FileDrop, validateFiles } from './FileDrop';
import { techniques, materialOptions, surfaceOptions, labelFor, formatBytes, uploadLimits } from '@/lib/quote/options';
import { stepTechniqueSchema, specsErrors, stepContactSchema, fieldErrors, todayIso } from '@/lib/quote/schema';
import { takePendingFiles } from '@/lib/quote/draft-files';
import { href } from '@/lib/i18n/routes';
import type { TechniqueId } from '@/lib/content/types';

type Draft = {
  techniques: TechniqueId[];
  material: string;
  materialDetail: string;
  quantity: string;
  surface: string;
  surfaceDetail: string;
  tolerances: string;
  deliveryDate: string;
  deliveryFlexible: boolean;
  remarks: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  reference: string;
  extra: string;
  privacy: boolean;
};

const emptyDraft: Draft = {
  techniques: [],
  material: '',
  materialDetail: '',
  quantity: '1',
  surface: '',
  surfaceDetail: '',
  tolerances: '',
  deliveryDate: '',
  deliveryFlexible: false,
  remarks: '',
  company: '',
  contactName: '',
  email: '',
  phone: '',
  reference: '',
  extra: '',
  privacy: false,
};

const STORAGE_KEY = 'grotech-quote-draft-v1';

const steps = [
  { key: 'techniek', title: 'Productietechniek', sub: 'Wat moet er gemaakt worden?' },
  { key: 'specificaties', title: 'Specificaties', sub: 'Materiaal, aantal en eisen' },
  { key: 'bestanden', title: 'Technische bestanden', sub: 'Tekeningen en modellen' },
  { key: 'contact', title: 'Contactgegevens', sub: 'Wie mogen we benaderen?' },
  { key: 'controle', title: 'Controleren & verzenden', sub: 'Overzicht van je aanvraag' },
] as const;

const stepOfField: Record<string, number> = {
  techniques: 0,
  material: 1, materialDetail: 1, quantity: 1, surface: 1, surfaceDetail: 1, tolerances: 1, deliveryDate: 1, deliveryFlexible: 1, remarks: 1,
  files: 2,
  company: 3, contactName: 3, email: 3, phone: 3, reference: 3, extra: 3, privacy: 3,
};

type Result = { reference: string | null; confirmationSent: boolean; mailMode?: string };

export function QuoteWizard() {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState<Draft>(emptyDraft);
  const [files, setFiles] = useState<File[]>([]);
  const [fileNotes, setFileNotes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hp, setHp] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const { token, refresh } = useFormToken('quote');

  // ── herstel concept + query-parameters ────────────────────────────────────
  useEffect(() => {
    let draft = emptyDraft;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) draft = { ...emptyDraft, ...JSON.parse(saved), privacy: false };
    } catch {}
    const t = params.get('techniek');
    if (t) {
      const match = techniques.find((x) => x.serviceSlug === t || x.id === t);
      if (match && !draft.techniques.includes(match.id)) draft = { ...draft, techniques: [...draft.techniques, match.id] };
    }
    setD(draft);
    const pending = takePendingFiles();
    if (pending.length) {
      const { accepted, rejected } = validateFiles([], pending);
      setFiles(accepted);
      setFileNotes(rejected);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated || result) return;
    try {
      // privacy-akkoord en bestanden worden bewust niet bewaard
      const { privacy: _p, ...rest } = d;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {}
  }, [d, hydrated, result]);

  const update = useCallback(<K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setErrors((p) => (p[k] ? { ...p, [k]: '' } : p));
  }, []);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    setSubmitError('');
    requestAnimationFrame(() => {
      const top = topRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + top - 110, behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(() => headingRef.current?.focus({ preventScroll: true }), reduce ? 0 : 360);
    });
  };

  const validate = (s: number): Record<string, string> => {
    if (s === 0) {
      const r = stepTechniqueSchema.safeParse({ techniques: d.techniques });
      return r.success ? {} : fieldErrors(r.error);
    }
    if (s === 1) return specsErrors(d);
    if (s === 3) {
      const r = stepContactSchema.safeParse(d);
      return r.success ? {} : fieldErrors(r.error);
    }
    return {};
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      const first = Object.keys(e)[0]!;
      requestAnimationFrame(() => (document.getElementById(`q-${first}`) ?? document.querySelector<HTMLElement>(`[data-field="${first}"] input`))?.focus());
      return;
    }
    go(step + 1);
  };

  // ── verzenden ─────────────────────────────────────────────────────────────
  const submit = async () => {
    for (const s of [0, 1, 3]) {
      const e = validate(s);
      if (Object.keys(e).length) {
        setErrors(e);
        go(s);
        return;
      }
    }
    if (!token) {
      await refresh();
      setSubmitError('De verbinding met de server wordt opnieuw opgebouwd. Probeer het over een paar seconden nog eens.');
      return;
    }
    setSending(true);
    setSubmitError('');
    setProgress(0);

    const payload = {
      techniques: d.techniques,
      material: d.material,
      materialDetail: d.materialDetail,
      quantity: Number(d.quantity),
      surface: d.surface,
      surfaceDetail: d.surfaceDetail,
      tolerances: d.tolerances,
      deliveryDate: d.deliveryDate,
      deliveryFlexible: d.deliveryFlexible,
      remarks: d.remarks,
      company: d.company,
      contactName: d.contactName,
      email: d.email,
      phone: d.phone,
      reference: d.reference,
      extra: d.extra,
      privacy: d.privacy,
    };
    const fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    fd.append('token', token);
    fd.append('website', hp);
    files.forEach((f) => fd.append('files', f, f.name));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/offerte');
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => {
      setSending(false);
      setSubmitError('Er is geen verbinding met de server. Controleer je internetverbinding en probeer het opnieuw. Je gegevens blijven bewaard.');
    };
    xhr.onload = () => {
      setSending(false);
      const data = (xhr.response ?? {}) as { ok?: boolean; error?: string; fields?: Record<string, string>; code?: string } & Result;
      if (xhr.status >= 200 && xhr.status < 300 && data.ok) {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {}
        setResult({ reference: data.reference, confirmationSent: data.confirmationSent, mailMode: data.mailMode });
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        return;
      }
      if (String(data.code ?? '').startsWith('token')) refresh();
      if (data.fields && Object.keys(data.fields).length) {
        setErrors(data.fields);
        const target = Math.min(...Object.keys(data.fields).map((k) => stepOfField[k.split('.')[0]!] ?? 4));
        if (target < 4) go(target);
      }
      setSubmitError(
        data.error ??
          (xhr.status === 413
            ? `De bestanden zijn samen te groot (max. ${uploadLimits.maxTotalBytes / 1024 / 1024} MB).`
            : xhr.status === 429
              ? 'Te veel aanvragen in korte tijd. Probeer het later opnieuw.'
              : 'Versturen is niet gelukt. Probeer het opnieuw.'),
      );
    };
    xhr.send(fd);
  };

  const pct = useMemo(() => ((step + (result ? 1 : 0)) / steps.length) * 100, [step, result]);

  if (result) return <Success result={result} email={d.email} name={d.contactName} />;

  const variants = {
    enter: (dd: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: dd * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (dd: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: dd * -28 }),
  };

  return (
    <div ref={topRef} className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* stappen */}
      <aside className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="text-sm font-bold text-offwhite">
              Stap {step + 1} van {steps.length} · <span className="text-mist">{steps[step]!.title}</span>
            </p>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-line lg:hidden" role="progressbar" aria-label="Voortgang" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
            <motion.div className="h-full bg-red" animate={{ width: `${Math.max(pct, 6)}%` }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.1, 1] }} />
          </div>
          <nav aria-label="Stappen van de aanvraag" className="hidden lg:block">
            <ol className="relative space-y-1">
              <span className="absolute top-5 bottom-5 left-[1.1875rem] w-px bg-line" aria-hidden="true" />
              {steps.map((s, i) => {
                const state = i === step ? 'current' : i <= maxStep ? 'visited' : 'todo';
                return (
                  <li key={s.key} className="relative">
                    <button
                      type="button"
                      disabled={i > maxStep || sending}
                      onClick={() => go(i)}
                      aria-current={i === step ? 'step' : undefined}
                      className="group flex w-full items-center gap-4 rounded-md p-1.5 pr-3 text-left transition-colors enabled:hover:bg-white/[0.03] disabled:cursor-default"
                    >
                      <span
                        className={`relative z-10 grid size-[1.875rem] shrink-0 place-items-center rounded-full border text-xs font-black transition-colors duration-300 ${
                          state === 'current' ? 'border-red bg-red text-black' : state === 'visited' ? 'border-offwhite/50 bg-black text-offwhite' : 'border-line-strong bg-black text-muted'
                        }`}
                      >
                        {state === 'visited' && i < step ? <Icon name="check" size={14} strokeWidth={2.6} /> : i + 1}
                      </span>
                      <span>
                        <span className={`block text-[0.9375rem] font-bold ${state === 'todo' ? 'text-muted' : 'text-offwhite'}`}>{s.title}</span>
                        <span className="block text-[0.8125rem] text-muted">{s.sub}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <ul className="mt-10 hidden space-y-4 border-t border-line pt-8 text-[0.875rem] text-mist lg:block">
            <li className="flex gap-3"><Icon name="lock" size={18} className="mt-0.5 shrink-0 text-red" />Bestanden worden versleuteld verzonden en vertrouwelijk opgeslagen.</li>
            <li className="flex gap-3"><Icon name="drawing" size={18} className="mt-0.5 shrink-0 text-red" />Geen automatische prijs: elke aanvraag wordt technisch beoordeeld.</li>
            <li className="flex gap-3"><Icon name="shield" size={18} className="mt-0.5 shrink-0 text-red" />Een aanvraag is vrijblijvend.</li>
          </ul>
        </div>
      </aside>

      {/* formulier */}
      <div className="lg:col-span-8 xl:col-span-9">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < steps.length - 1) next();
            else submit();
          }}
          className="relative overflow-hidden rounded-md border border-line bg-charcoal/50"
          aria-labelledby="step-title"
        >
          <Honeypot value={hp} onChange={setHp} />
          <div className="absolute inset-x-0 top-0 hidden h-0.5 bg-line lg:block" aria-hidden="true">
            <motion.div className="h-full bg-red" animate={{ width: `${Math.max(pct, 4)}%` }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.1, 1] }} />
          </div>
          <div className="p-5 sm:p-8 md:p-10">
            <p className="label-caps text-muted">
              <span className="text-red">{String(step + 1).padStart(2, '0')}</span> / {String(steps.length).padStart(2, '0')}
            </p>
            <h2 id="step-title" ref={headingRef} tabIndex={-1} className="mt-3 text-[clamp(1.625rem,1.2rem+1.4vw,2.5rem)] text-offwhite outline-none">
              {steps[step]!.title}
            </h2>

            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: [0.2, 0.7, 0.1, 1] }} className="mt-8">
                {step === 0 && files.length > 0 && (
                  <p className="mb-6 flex items-center gap-3 rounded-[3px] border border-line-strong bg-black/40 p-4 text-[0.9375rem] text-mist" role="status">
                    <Icon name="file" size={20} className="shrink-0 text-red" />
                    <span><strong className="text-offwhite">{files.length} {files.length === 1 ? 'bestand' : 'bestanden'} klaargezet.</strong> Je vindt ze terug in stap 3.</span>
                  </p>
                )}
                {step === 0 && <StepTechnique d={d} update={update} error={errors.techniques} />}
                {step === 1 && <StepSpecs d={d} update={update} errors={errors} />}
                {step === 2 && (
                  <div>
                    <p className="mb-6 max-w-2xl text-mist">
                      Upload je 3D-modellen en tekeningen. Een STEP-bestand in combinatie met een PDF-tekening met toleranties geeft de snelste en meest nauwkeurige offerte.
                    </p>
                    <FileDrop files={files} setFiles={setFiles} notes={fileNotes} setNotes={setFileNotes} error={errors.files} />
                  </div>
                )}
                {step === 3 && <StepContact d={d} update={update} errors={errors} />}
                {step === 4 && <Review d={d} files={files} edit={go} />}
              </motion.div>
            </AnimatePresence>

            {submitError && (
              <p className="mt-8 flex gap-3 rounded-[3px] border border-red/50 bg-red/[0.08] p-4 text-[0.9375rem] text-offwhite" role="alert">
                <Icon name="alert" size={20} className="mt-0.5 shrink-0 text-red" />
                {submitError}
              </p>
            )}
            {sending && (
              <div className="mt-8" role="status" aria-live="polite">
                <div className="flex justify-between text-sm text-mist">
                  <span>{progress < 100 ? `Bestanden uploaden… ${progress}%` : 'Aanvraag verwerken…'}</span>
                  {files.length > 0 && <span>{formatBytes(files.reduce((s, f) => s + f.size, 0))}</span>}
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-red transition-[width] duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-line bg-black/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-10">
            {step > 0 ? (
              <button type="button" onClick={() => go(step - 1)} disabled={sending} className="inline-flex min-h-12 items-center gap-2 self-start rounded-[3px] px-2 text-sm font-bold tracking-[0.12em] text-mist uppercase transition-colors hover:text-offwhite disabled:opacity-50">
                <Icon name="arrow-left" size={16} strokeWidth={2} className="text-red" /> Vorige
              </button>
            ) : (
              <Link href={href('services')} className="text-sm text-muted hover:text-offwhite">Twijfel je over de techniek? Bekijk het overzicht.</Link>
            )}
            {step < steps.length - 1 ? (
              <Button type="submit" size="lg">{step === 2 && !files.length ? 'Verder zonder bestanden' : 'Volgende stap'}</Button>
            ) : (
              <Button type="submit" size="lg" icon={sending ? null : 'arrow-right'} disabled={sending}>
                {sending ? 'Bezig met verzenden…' : 'Aanvraag definitief verzenden'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ── stap 1 ───────────────────────────────────────────────────────────────────
function StepTechnique({ d, update, error }: { d: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void; error?: string }) {
  const toggle = (id: TechniqueId) => update('techniques', d.techniques.includes(id) ? d.techniques.filter((t) => t !== id) : [...d.techniques, id]);
  return (
    <fieldset data-field="techniques" aria-describedby={error ? 'q-techniques-error' : 'q-techniques-hint'}>
      <legend className="mb-6 text-mist">Kies één of meer technieken. Je kunt ze combineren in één aanvraag.</legend>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {techniques.map((t, i) => {
          const on = d.techniques.includes(t.id);
          return (
            <label
              key={t.id}
              className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-md border transition-[border-color,background-color,box-shadow] duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-offwhite ${
                on ? 'border-red bg-red/[0.06] shadow-[0_0_0_1px_rgba(241,10,29,0.5)]' : 'border-line-strong bg-black/40 hover:border-offwhite/40'
              }`}
            >
              <input id={i === 0 ? 'q-techniques' : undefined} type="checkbox" className="sr-only" checked={on} onChange={() => toggle(t.id)} aria-invalid={Boolean(error)} />
              <span className="relative block aspect-[16/9] overflow-hidden bg-black">
                {t.image ? (
                  <img src={t.image} alt="" className={`h-full w-full object-cover transition-[transform,opacity] duration-700 ${on ? 'scale-[1.04] opacity-100' : 'opacity-75 group-hover:opacity-100'}`} loading="lazy" />
                ) : (
                  <span className="tech-grid grid h-full w-full place-items-center">
                    <Icon name="layers" size={44} strokeWidth={1.2} className="text-red" />
                  </span>
                )}
                <span className={`absolute top-3 right-3 grid size-7 place-items-center rounded-[3px] border transition-colors ${on ? 'border-red bg-red text-black' : 'border-offwhite/40 bg-black/50 text-transparent'}`}>
                  <Icon name="check" size={16} strokeWidth={2.6} />
                </span>
              </span>
              <span className="p-4">
                <span className="block font-black text-offwhite">{t.label}</span>
                <span className="mt-1 block text-[0.8125rem] text-muted">{t.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id="q-techniques-error" className="mt-4 text-[0.8125rem] font-bold text-[#ff6b77]" role="alert">{error}</p>
      ) : (
        <p id="q-techniques-hint" className="mt-4 text-[0.8125rem] text-muted">{d.techniques.length ? `${d.techniques.length} geselecteerd` : 'Nog niets geselecteerd'}</p>
      )}
    </fieldset>
  );
}

// ── stap 2 ───────────────────────────────────────────────────────────────────
function Chips<T extends { id: string; label: string }>({ name, options, value, onChange, error, legend }: { name: string; options: readonly T[]; value: string; onChange: (v: string) => void; error?: string; legend: string }) {
  return (
    <fieldset data-field={name} aria-describedby={error ? `q-${name}-error` : undefined}>
      <legend className="mb-3 text-[0.9375rem] font-bold text-offwhite">
        {legend} <span className="text-red" aria-hidden="true">*</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const on = value === o.id;
          return (
            <label key={o.id} className={`cursor-pointer rounded-[3px] border px-4 py-2.5 text-[0.9375rem] font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-offwhite ${on ? 'border-offwhite bg-offwhite text-black' : 'border-line-strong text-mist hover:border-offwhite/40 hover:text-offwhite'}`}>
              <input id={i === 0 ? `q-${name}` : undefined} type="radio" name={name} value={o.id} checked={on} onChange={() => onChange(o.id)} className="sr-only" aria-invalid={Boolean(error)} />
              {o.label}
            </label>
          );
        })}
      </div>
      {error && <p id={`q-${name}-error`} className="mt-2 text-[0.8125rem] font-bold text-[#ff6b77]" role="alert">{error}</p>}
    </fieldset>
  );
}

function StepSpecs({ d, update, errors }: { d: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void; errors: Record<string, string> }) {
  const qty = Number(d.quantity) || 0;
  return (
    <div className="space-y-9">
      <div className="space-y-4">
        <Chips name="material" legend="Materiaal" options={materialOptions} value={d.material} onChange={(v) => update('material', v)} error={errors.material} />
        {d.material && (
          <Field
            id="q-materialDetail"
            label={d.material === 'anders' || d.material === 'meerdere' ? 'Toelichting materiaal' : 'Kwaliteit / legering'}
            required={d.material === 'anders' || d.material === 'meerdere'}
            optional={!(d.material === 'anders' || d.material === 'meerdere')}
            hint="Bijvoorbeeld een legering, kwaliteit of de toepassing van het onderdeel."
            error={errors.materialDetail}
          >
            <input id="q-materialDetail" className={inputClass} value={d.materialDetail} onChange={(e) => update('materialDetail', e.target.value)} maxLength={200} aria-invalid={Boolean(errors.materialDetail)} aria-describedby={describedBy('q-materialDetail', errors.materialDetail, true)} />
          </Field>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Field id="q-quantity" label="Aantal" required hint="Totaal aantal stuks per onderdeel. Meerdere onderdelen? Licht toe bij opmerkingen." error={errors.quantity}>
          <div className="flex">
            <button type="button" aria-label="Aantal verlagen" onClick={() => update('quantity', String(Math.max(1, qty - 1)))} className="grid w-12 shrink-0 place-items-center rounded-l-[3px] border border-r-0 border-line-strong text-mist hover:text-offwhite">
              <Icon name="minus" size={16} strokeWidth={2} />
            </button>
            <input
              id="q-quantity"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`${inputClass} rounded-none text-center font-bold tabular-nums`}
              value={d.quantity}
              onChange={(e) => update('quantity', e.target.value.replace(/[^\d]/g, '').slice(0, 7))}
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={describedBy('q-quantity', errors.quantity, true)}
            />
            <button type="button" aria-label="Aantal verhogen" onClick={() => update('quantity', String(Math.min(1_000_000, qty + 1)))} className="grid w-12 shrink-0 place-items-center rounded-r-[3px] border border-l-0 border-line-strong text-mist hover:text-offwhite">
              <Icon name="plus" size={16} strokeWidth={2} />
            </button>
          </div>
        </Field>
        <div>
          <Field id="q-deliveryDate" label="Gewenste leverdatum" required={!d.deliveryFlexible} error={errors.deliveryDate} hint="We bevestigen de haalbare levertijd in de offerte.">
            <input
              id="q-deliveryDate"
              type="date"
              min={todayIso()}
              className={`${inputClass} [color-scheme:dark]`}
              value={d.deliveryDate}
              onChange={(e) => update('deliveryDate', e.target.value)}
              aria-invalid={Boolean(errors.deliveryDate)}
              aria-describedby={describedBy('q-deliveryDate', errors.deliveryDate, true)}
            />
          </Field>
          <label className="mt-3 flex cursor-pointer items-center gap-3 text-[0.9375rem] text-mist">
            <input type="checkbox" checked={d.deliveryFlexible} onChange={(e) => update('deliveryFlexible', e.target.checked)} className="size-5 accent-[#F10A1D]" />
            Leverdatum is flexibel
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <Chips name="surface" legend="Oppervlaktebehandeling" options={surfaceOptions} value={d.surface} onChange={(v) => update('surface', v)} error={errors.surface} />
        {d.surface === 'anders' && (
          <Field id="q-surfaceDetail" label="Gewenste behandeling" required error={errors.surfaceDetail}>
            <input id="q-surfaceDetail" className={inputClass} value={d.surfaceDetail} onChange={(e) => update('surfaceDetail', e.target.value)} maxLength={200} aria-invalid={Boolean(errors.surfaceDetail)} aria-describedby={describedBy('q-surfaceDetail', errors.surfaceDetail)} />
          </Field>
        )}
      </div>

      <Field id="q-tolerances" label="Tolerantie-eisen" optional hint="Bijvoorbeeld een algemene tolerantienorm, of ‘volgens tekening’. Kritische maten graag op de tekening aangeven." error={errors.tolerances}>
        <input id="q-tolerances" className={inputClass} value={d.tolerances} onChange={(e) => update('tolerances', e.target.value)} maxLength={1000} placeholder="Volgens tekening" aria-describedby={describedBy('q-tolerances', errors.tolerances, true)} />
      </Field>

      <Field id="q-remarks" label="Opmerkingen" optional hint="Toepassing, revisie, verpakking, documentatie-eisen of andere wensen." error={errors.remarks}>
        <textarea id="q-remarks" rows={5} className={`${inputClass} resize-y`} value={d.remarks} onChange={(e) => update('remarks', e.target.value)} maxLength={4000} aria-describedby={describedBy('q-remarks', errors.remarks, true)} />
      </Field>
    </div>
  );
}

// ── stap 4 ───────────────────────────────────────────────────────────────────
function StepContact({ d, update, errors }: { d: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void; errors: Record<string, string> }) {
  const input = (k: keyof Draft, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input
      id={`q-${k}`}
      className={inputClass}
      value={d[k] as string}
      onChange={(e) => update(k, e.target.value as never)}
      aria-invalid={Boolean(errors[k])}
      aria-describedby={describedBy(`q-${k}`, errors[k])}
      {...props}
    />
  );
  return (
    <div className="space-y-7">
      <div className="grid gap-7 md:grid-cols-2">
        <Field id="q-company" label="Bedrijfsnaam" required error={errors.company}>{input('company', { autoComplete: 'organization', maxLength: 160 })}</Field>
        <Field id="q-contactName" label="Contactpersoon" required error={errors.contactName}>{input('contactName', { autoComplete: 'name', maxLength: 120 })}</Field>
        <Field id="q-email" label="E-mailadres" required error={errors.email}>{input('email', { type: 'email', inputMode: 'email', autoComplete: 'email', maxLength: 254 })}</Field>
        <Field id="q-phone" label="Telefoonnummer" required error={errors.phone}>{input('phone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 24 })}</Field>
        <Field id="q-reference" label="Je eigen referentie of projectnummer" optional error={errors.reference}>{input('reference', { maxLength: 80 })}</Field>
      </div>
      <Field id="q-extra" label="Aanvullende informatie" optional hint="Bijvoorbeeld afleveradres, gewenste contactmoment of inkoopvoorwaarden." error={errors.extra}>
        <textarea id="q-extra" rows={4} className={`${inputClass} resize-y`} value={d.extra} onChange={(e) => update('extra', e.target.value)} maxLength={2000} />
      </Field>
      <div data-field="privacy">
        <label className="flex cursor-pointer gap-3 text-[0.9375rem] text-mist">
          <input id="q-privacy" type="checkbox" checked={d.privacy} onChange={(e) => update('privacy', e.target.checked)} className="mt-1 size-5 shrink-0 accent-[#F10A1D]" aria-invalid={Boolean(errors.privacy)} aria-describedby={describedBy('q-privacy', errors.privacy)} />
          <span>
            Ik ga akkoord dat GROTECH mijn gegevens en bestanden verwerkt om deze aanvraag te beoordelen en te offreren, en ze daarvoor vertrouwelijk deelt met de betrokken productiepartner(s), zoals beschreven in de{' '}
            <Link href={href('privacy')} target="_blank" className="text-offwhite underline decoration-red underline-offset-4">privacyverklaring</Link>. <span className="text-red" aria-hidden="true">*</span>
          </span>
        </label>
        {errors.privacy && <p id="q-privacy-error" className="mt-2 text-[0.8125rem] font-bold text-[#ff6b77]" role="alert">{errors.privacy}</p>}
      </div>
    </div>
  );
}

// ── stap 5 ───────────────────────────────────────────────────────────────────
function Review({ d, files, edit }: { d: Draft; files: File[]; edit: (s: number) => void }) {
  const date = d.deliveryDate ? new Date(`${d.deliveryDate}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const groups: { title: string; step: number; rows: [string, React.ReactNode][] }[] = [
    { title: 'Productietechniek', step: 0, rows: [['Techniek(en)', d.techniques.map((t) => labelFor(techniques, t)).join(', ')]] },
    {
      title: 'Specificaties',
      step: 1,
      rows: [
        ['Materiaal', [labelFor(materialOptions, d.material), d.materialDetail].filter(Boolean).join(' — ')],
        ['Aantal', d.quantity],
        ['Oppervlaktebehandeling', [labelFor(surfaceOptions, d.surface), d.surfaceDetail].filter(Boolean).join(' — ')],
        ['Toleranties', d.tolerances || '—'],
        ['Leverdatum', d.deliveryFlexible ? `Flexibel${date ? ` (bij voorkeur ${date})` : ''}` : date],
        ['Opmerkingen', d.remarks || '—'],
      ],
    },
    {
      title: 'Technische bestanden',
      step: 2,
      rows: [['Bestanden', files.length ? (
        <ul className="space-y-1">{files.map((f) => <li key={f.name + f.size} className="flex justify-between gap-4"><span className="truncate">{f.name}</span><span className="shrink-0 text-muted">{formatBytes(f.size)}</span></li>)}</ul>
      ) : (
        <span className="text-[#ff6b77]">Geen bestanden — je kunt ze ook later nasturen.</span>
      )]],
    },
    {
      title: 'Contactgegevens',
      step: 3,
      rows: [
        ['Bedrijf', d.company],
        ['Contactpersoon', d.contactName],
        ['E-mail', d.email],
        ['Telefoon', d.phone],
        ...(d.reference ? [['Referentie', d.reference] as [string, string]] : []),
        ...(d.extra ? [['Aanvullend', d.extra] as [string, string]] : []),
      ],
    },
  ];
  return (
    <div className="space-y-5">
      <p className="text-mist">Controleer je aanvraag. Na verzending ontvang je een referentienummer en beoordelen we je aanvraag technisch.</p>
      {groups.map((g) => (
        <section key={g.title} className="rounded-md border border-line bg-black/40" aria-label={g.title}>
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h3 className="label-caps text-mist">{g.title}</h3>
            <button type="button" onClick={() => edit(g.step)} className="text-sm font-bold text-offwhite underline decoration-red underline-offset-4 hover:text-white">
              Wijzigen<span className="sr-only"> {g.title.toLowerCase()}</span>
            </button>
          </div>
          <dl className="divide-y divide-line">
            {g.rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <dt className="text-[0.875rem] text-muted">{k}</dt>
                <dd className="text-[0.9375rem] break-words whitespace-pre-line text-offwhite">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

// ── bevestiging ──────────────────────────────────────────────────────────────
function Success({ result, email, name }: { result: Result; email: string; name: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="mx-auto max-w-3xl" role="status" aria-live="polite">
      <div className="overflow-hidden rounded-md border border-line bg-charcoal/50">
        <div className="h-0.5 bg-red" />
        <div className="p-7 sm:p-10 md:p-14">
          <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="grid size-16 place-items-center rounded-full bg-red text-black">
            <Icon name="check" size={30} strokeWidth={2.6} />
          </motion.span>
          <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-[length:var(--text-h2)] text-offwhite outline-none">
            Aanvraag ontvangen{name ? `, ${name.split(' ')[0]}` : ''}<span className="text-red">.</span>
          </h2>
          {result.reference && (
            <p className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-[3px] border border-line-strong bg-black px-4 py-3">
              <span className="label-caps text-muted">Referentie</span>
              <span className="font-mono text-lg font-bold text-offwhite">{result.reference}</span>
            </p>
          )}
          <p className="mt-6 text-[length:var(--text-lead)] leading-relaxed text-mist">
            {result.confirmationSent ? (
              <>We hebben een bevestiging gestuurd naar <strong className="text-offwhite">{email}</strong>. </>
            ) : (
              <>Bewaar je referentienummer; vermeld het bij contact over deze aanvraag. </>
            )}
            Je aanvraag is veilig opgeslagen en wordt technisch beoordeeld.
          </p>
          {result.mailMode === 'outbox' && (
            <p className="mt-4 rounded-[3px] border border-dashed border-line-strong p-3 font-mono text-xs text-muted">
              Ontwikkelomgeving: SMTP is niet geconfigureerd. De e-mails zijn opgeslagen in storage/outbox in plaats van verzonden.
            </p>
          )}
          <ol className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {[
              ['Technische beoordeling', 'We controleren je tekeningen en specificaties.'],
              ['Eventuele vragen', 'Ontbreekt er iets, dan nemen we contact met je op.'],
              ['Offerte', 'Je ontvangt een heldere offerte met prijs en levertijd.'],
            ].map(([t, x], i) => (
              <li key={t}>
                <span className="font-mono text-xs text-red">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 font-bold text-offwhite">{t}</p>
                <p className="mt-1 text-[0.875rem] text-muted">{x}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={href('home')} variant="secondary">Naar de homepage</ButtonLink>
            <ButtonLink href={href('services')} variant="ghost">Bekijk productietechnieken</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
