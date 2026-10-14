'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../Icon';
import { uploadLimits, acceptAttribute, formatBytes } from '@/lib/quote/options';

const ext = (n: string) => (n.toLowerCase().match(/\.(x_t|x_b|[a-z0-9]{1,5})$/)?.[1] ?? '');

/** Zelfde regels als de server — de server controleert daarnaast de inhoud. */
export function validateFiles(current: File[], incoming: File[]) {
  const accepted = [...current];
  const rejected: string[] = [];
  let total = accepted.reduce((s, f) => s + f.size, 0);
  for (const f of incoming) {
    if (!(uploadLimits.extensions as readonly string[]).includes(ext(f.name))) rejected.push(`${f.name}: bestandstype niet toegestaan.`);
    else if (f.size === 0) rejected.push(`${f.name}: bestand is leeg.`);
    else if (f.size > uploadLimits.maxFileBytes) rejected.push(`${f.name}: groter dan ${formatBytes(uploadLimits.maxFileBytes)}.`);
    else if (accepted.some((a) => a.name === f.name && a.size === f.size)) rejected.push(`${f.name}: is al toegevoegd.`);
    else if (accepted.length >= uploadLimits.maxFiles) rejected.push(`${f.name}: maximaal ${uploadLimits.maxFiles} bestanden.`);
    else if (total + f.size > uploadLimits.maxTotalBytes) rejected.push(`${f.name}: totaal zou groter worden dan ${formatBytes(uploadLimits.maxTotalBytes)}.`);
    else {
      accepted.push(f);
      total += f.size;
    }
  }
  return { accepted, rejected };
}

const typeLabel = (n: string) => {
  const e = ext(n);
  if (['step', 'stp', 'iges', 'igs', 'x_t', 'x_b', 'sat', 'stl'].includes(e)) return '3D';
  if (['dxf', 'dwg'].includes(e)) return '2D';
  if (e === 'pdf') return 'PDF';
  if (e === 'zip') return 'ZIP';
  return 'IMG';
};

export function FileDrop({ files, setFiles, notes, setNotes, error }: { files: File[]; setFiles: (f: File[]) => void; notes: string[]; setNotes: (n: string[]) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const reduce = useReducedMotion();
  const total = files.reduce((s, f) => s + f.size, 0);

  const add = (list: FileList | File[] | null) => {
    if (!list) return;
    const { accepted, rejected } = validateFiles(files, Array.from(list));
    setFiles(accepted);
    setNotes(rejected);
  };

  return (
    <div data-field="files">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={`relative flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center transition-all duration-300 sm:py-12 ${over ? 'border-red bg-red/[0.06]' : error ? 'border-red/70' : 'border-line-strong bg-black/30 hover:border-offwhite/40'}`}
      >
        <span className={`grid size-14 place-items-center rounded-full border transition-colors ${over ? 'border-red bg-red text-black' : 'border-line-strong text-red'}`}>
          <Icon name="upload" size={24} strokeWidth={1.8} />
        </span>
        <p className="mt-5 text-lg font-black text-offwhite">
          Sleep bestanden hierheen of{' '}
          <button type="button" id="q-files" onClick={() => input.current?.click()} className="text-offwhite underline decoration-red decoration-2 underline-offset-4 hover:text-white">
            kies bestanden
          </button>
        </p>
        <p className="mt-2 max-w-md text-[0.8125rem] text-muted">
          {uploadLimits.extensions.map((e) => e.toUpperCase()).join(' · ')}
        </p>
        <p className="mt-1 text-[0.8125rem] text-muted">
          Max. {uploadLimits.maxFiles} bestanden · {formatBytes(uploadLimits.maxFileBytes)} per bestand · {formatBytes(uploadLimits.maxTotalBytes)} totaal
        </p>
        <input ref={input} type="file" multiple accept={acceptAttribute} className="sr-only" tabIndex={-1} aria-label="Bestanden kiezen" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>

      {(notes.length > 0 || error) && (
        <div className="mt-4 rounded-[3px] border border-red/50 bg-red/[0.07] p-4" role="alert">
          <p className="flex items-center gap-2 text-sm font-bold text-offwhite"><Icon name="alert" size={18} className="text-red" /> Niet alle bestanden zijn toegevoegd</p>
          <ul className="mt-2 space-y-1 text-[0.8125rem] text-mist">
            {error && <li>{error}</li>}
            {notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between text-[0.8125rem] text-muted">
            <span aria-live="polite">{files.length} {files.length === 1 ? 'bestand' : 'bestanden'} · {formatBytes(total)}</span>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className="h-full bg-red/80" style={{ width: `${Math.min(100, (total / uploadLimits.maxTotalBytes) * 100)}%` }} />
            </div>
          </div>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {files.map((f) => (
                <motion.li
                  key={f.name + f.size}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-4 rounded-[3px] border border-line bg-black/50 py-2.5 pr-2 pl-3"
                >
                  <span className="grid h-10 w-11 shrink-0 place-items-center rounded-[2px] bg-graphite font-mono text-[0.6875rem] font-bold text-offwhite">{typeLabel(f.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9375rem] font-bold text-offwhite">{f.name}</span>
                    <span className="block text-[0.8125rem] text-muted">.{ext(f.name)} · {formatBytes(f.size)}</span>
                  </span>
                  <Icon name="check" size={18} strokeWidth={2.2} className="text-red" />
                  <button type="button" onClick={() => setFiles(files.filter((x) => x !== f))} className="grid size-10 place-items-center rounded-[3px] text-muted transition-colors hover:bg-white/5 hover:text-offwhite" aria-label={`${f.name} verwijderen`}>
                    <Icon name="x" size={18} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <p className="mt-6 flex gap-3 text-[0.875rem] text-muted">
        <Icon name="lock" size={18} className="mt-0.5 shrink-0 text-red" />
        Bestanden worden pas verzonden als je de aanvraag in de laatste stap verstuurt. Ze worden versleuteld opgeslagen en zijn niet publiek toegankelijk.
      </p>
    </div>
  );
}
