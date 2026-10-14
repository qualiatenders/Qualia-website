import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/server/admin-auth';
import { getQuote, quoteStatuses } from '@/lib/server/storage';
import { techniques, materialOptions, surfaceOptions, labelFor, formatBytes } from '@/lib/quote/options';
import { setStatus, removeQuote } from '../../actions';
import { StatusBadge } from '../../StatusBadge';
import { Icon } from '@/components/Icon';

const fmt = (iso: string) => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Amsterdam' });

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const q = await getQuote((await params).id);
  if (!q) notFound();
  const p = q.payload;
  const rows: [string, string][] = [
    ['Techniek(en)', p.techniques.map((t) => labelFor(techniques, t)).join(', ')],
    ['Materiaal', [labelFor(materialOptions, p.material), p.materialDetail].filter(Boolean).join(' — ')],
    ['Aantal', String(p.quantity)],
    ['Oppervlaktebehandeling', [labelFor(surfaceOptions, p.surface), p.surfaceDetail].filter(Boolean).join(' — ')],
    ['Toleranties', p.tolerances || '—'],
    ['Leverdatum', p.deliveryFlexible ? `Flexibel ${p.deliveryDate ? `(voorkeur ${p.deliveryDate})` : ''}` : p.deliveryDate],
    ['Opmerkingen', p.remarks || '—'],
  ];
  const contact: [string, string][] = [
    ['Bedrijf', p.company],
    ['Contactpersoon', p.contactName],
    ['E-mail', p.email],
    ['Telefoon', p.phone],
    ['Referentie klant', p.reference || '—'],
    ['Aanvullend', p.extra || '—'],
  ];
  const mailLabel = { sent: 'verzonden', outbox: 'in outbox (dev)', failed: 'MISLUKT', skipped: 'niet verzonden' } as const;

  return (
    <div>
      <Link href="/beheer" className="inline-flex items-center gap-2 text-sm text-mist hover:text-offwhite"><Icon name="arrow-left" size={16} className="text-red" /> Alle aanvragen</Link>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-3xl text-offwhite">{q.id}</h1>
        <StatusBadge status={q.status} />
      </div>
      <p className="mt-2 text-mist">Ontvangen {fmt(q.createdAt)} · Notificatie: {mailLabel[q.mail.notify]} · Bevestiging klant: {mailLabel[q.mail.confirmation]}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="rounded-md border border-line lg:col-span-2">
          <h2 className="label-caps border-b border-line p-4 text-muted">Specificaties</h2>
          <dl className="divide-y divide-line">{rows.map(([k, v]) => <div key={k} className="grid gap-2 p-4 sm:grid-cols-[12rem_1fr]"><dt className="text-sm text-muted">{k}</dt><dd className="whitespace-pre-line text-offwhite">{v}</dd></div>)}</dl>
          <h2 className="label-caps border-y border-line p-4 text-muted">Bestanden ({q.files.length})</h2>
          <ul className="divide-y divide-line">
            {q.files.length === 0 && <li className="p-4 text-muted">Geen bestanden bijgevoegd.</li>}
            {q.files.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <span>
                  <span className="block font-bold text-offwhite">{f.name}</span>
                  <span className="block font-mono text-xs text-muted">{formatBytes(f.size)} · sha256 {f.sha256.slice(0, 16)}… · {f.encrypted ? 'versleuteld' : 'onversleuteld'}</span>
                </span>
                <a href={`/beheer/bestand/${q.id}/${f.id}`} className="inline-flex items-center gap-2 rounded-[3px] border border-line-strong px-3 py-2 text-sm font-bold text-offwhite hover:border-offwhite/60">
                  <Icon name="arrow-right" size={14} className="rotate-90 text-red" /> Downloaden
                </a>
              </li>
            ))}
          </ul>
        </section>
        <div className="space-y-8">
          <section className="rounded-md border border-line">
            <h2 className="label-caps border-b border-line p-4 text-muted">Contact</h2>
            <dl className="divide-y divide-line">{contact.map(([k, v]) => <div key={k} className="p-4"><dt className="text-xs text-muted">{k}</dt><dd className="mt-1 break-words whitespace-pre-line text-offwhite">{k === 'E-mail' ? <a className="underline" href={`mailto:${v}?subject=${encodeURIComponent(`Uw aanvraag ${q.id}`)}`}>{v}</a> : v}</dd></div>)}</dl>
          </section>
          <section className="rounded-md border border-line p-4">
            <h2 className="label-caps text-muted">Status</h2>
            <form action={setStatus} className="mt-4 flex gap-2">
              <input type="hidden" name="id" value={q.id} />
              <select name="status" defaultValue={q.status} className="flex-1 rounded-[3px] border border-line-strong bg-black px-3 py-2 text-offwhite" aria-label="Status">
                {quoteStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="rounded-[3px] bg-offwhite px-4 py-2 text-sm font-bold text-black">Opslaan</button>
            </form>
            <ul className="mt-4 space-y-1 text-xs text-muted">{q.history.map((h, i) => <li key={i}>{fmt(h.at)} — {h.status}</li>)}</ul>
          </section>
          <section className="rounded-md border border-red/40 p-4">
            <h2 className="label-caps text-muted">Verwijderen</h2>
            <p className="mt-2 text-sm text-mist">Verwijdert de aanvraag en alle bestanden definitief (bijv. na afloop van de bewaartermijn).</p>
            <form action={removeQuote} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={q.id} />
              <label className="flex items-center gap-2 text-sm text-mist"><input type="checkbox" name="confirm" value="ja" required className="accent-[#F10A1D]" /> Ik weet het zeker</label>
              <button className="rounded-[3px] border border-red px-4 py-2 text-sm font-bold text-offwhite hover:bg-red hover:text-black">Definitief verwijderen</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
