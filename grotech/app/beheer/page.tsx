import Link from 'next/link';
import { requireAdmin } from '@/lib/server/admin-auth';
import { listQuotes, listContacts } from '@/lib/server/storage';
import { mailIsConfigured } from '@/lib/server/mail';
import { encryptionKey } from '@/lib/server/config';
import { techniques, labelFor } from '@/lib/quote/options';
import { logout, removeContact } from './actions';
import { StatusBadge } from './StatusBadge';

const fmt = (iso: string) => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Amsterdam' });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const [quotes, contacts] = await Promise.all([listQuotes(), listContacts()]);
  const shown = status ? quotes.filter((q) => q.status === status) : quotes;
  const warnings = [!mailIsConfigured() && 'E-mail (SMTP) is niet geconfigureerd: er worden geen notificaties of bevestigingen verstuurd.', !encryptionKey() && 'FILE_ENCRYPTION_KEY ontbreekt: bestanden worden onversleuteld opgeslagen.'].filter(Boolean);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Beheer</p>
          <h1 className="mt-4 text-4xl text-offwhite">Offerteaanvragen</h1>
        </div>
        <form action={logout}><button className="text-sm font-bold text-mist underline decoration-red underline-offset-4 hover:text-offwhite">Uitloggen</button></form>
      </div>

      {warnings.length > 0 && (
        <ul className="mt-8 space-y-2">
          {warnings.map((w) => <li key={w as string} className="rounded-[3px] border border-red/50 bg-red/[0.07] p-3 text-sm text-offwhite">{w}</li>)}
        </ul>
      )}

      <nav className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="Filter op status">
        {[['', 'Alle'], ['nieuw', 'Nieuw'], ['in-behandeling', 'In behandeling'], ['geoffreerd', 'Geoffreerd'], ['afgesloten', 'Afgesloten']].map(([v, l]) => (
          <Link key={v} href={v ? `/beheer?status=${v}` : '/beheer'} className={`rounded-full border px-4 py-1.5 font-bold ${(status ?? '') === v ? 'border-offwhite bg-offwhite text-black' : 'border-line-strong text-mist hover:text-offwhite'}`}>
            {l} <span className="opacity-60">({v ? quotes.filter((q) => q.status === v).length : quotes.length})</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="bg-charcoal text-muted">
            <tr>{['Referentie', 'Ontvangen', 'Bedrijf', 'Techniek', 'Aantal', 'Bestanden', 'Status'].map((h) => <th key={h} scope="col" className="label-caps p-3 text-[0.6875rem]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted">Nog geen aanvragen{status ? ' met deze status' : ''}.</td></tr>}
            {shown.map((q) => (
              <tr key={q.id} className="border-t border-line hover:bg-white/[0.02]">
                <td className="p-3"><Link href={`/beheer/aanvragen/${q.id}`} className="font-mono font-bold text-offwhite underline decoration-red underline-offset-4">{q.id}</Link></td>
                <td className="p-3 text-mist">{fmt(q.createdAt)}</td>
                <td className="p-3 text-offwhite">{q.payload.company}<span className="block text-xs text-muted">{q.payload.contactName}</span></td>
                <td className="p-3 text-mist">{q.payload.techniques.map((t) => labelFor(techniques, t)).join(', ')}</td>
                <td className="p-3 text-mist tabular-nums">{q.payload.quantity}</td>
                <td className="p-3 text-mist">{q.files.length}</td>
                <td className="p-3"><StatusBadge status={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-16 text-2xl text-offwhite">Contactberichten</h2>
      <ul className="mt-6 space-y-3">
        {contacts.length === 0 && <li className="text-muted">Nog geen berichten.</li>}
        {contacts.map((c) => (
          <li key={c.id} className="rounded-md border border-line p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-bold text-offwhite">{c.payload.name}{c.payload.company && <span className="font-normal text-muted"> · {c.payload.company}</span>}</p>
              <p className="font-mono text-xs text-muted">{c.id} · {fmt(c.createdAt)}</p>
            </div>
            <p className="mt-1 text-sm"><a className="text-mist underline" href={`mailto:${c.payload.email}`}>{c.payload.email}</a>{c.payload.phone && <span className="text-muted"> · {c.payload.phone}</span>}</p>
            {c.payload.subject && <p className="mt-3 font-bold text-offwhite">{c.payload.subject}</p>}
            <p className="mt-2 whitespace-pre-line text-mist">{c.payload.message}</p>
            <form action={removeContact} className="mt-3"><input type="hidden" name="id" value={c.id} /><button className="text-xs text-muted underline hover:text-offwhite">Verwijderen</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
