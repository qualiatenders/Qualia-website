import 'server-only';
import { uploadLimits } from '@/lib/quote/options';

export type FileCheck = { ok: true; ext: string; safeName: string } | { ok: false; error: string };

/** Bestandsnaam ontdoen van paden en vreemde tekens; extensie blijft behouden. */
export function sanitizeFilename(name: string) {
  const base = name.split(/[\\/]/).pop() ?? 'bestand';
  const cleaned = base
    .normalize('NFKD')
    .replace(/[^\w.\- ()]+/g, '_')
    .replace(/\s+/g, ' ')
    .replace(/^\.+/, '')
    .trim()
    .slice(-120);
  return cleaned || 'bestand';
}

export function extensionOf(name: string) {
  const lower = name.toLowerCase();
  const m = lower.match(/\.(x_t|x_b|[a-z0-9]{1,5})$/);
  return m ? m[1]! : '';
}

const ascii = (buf: Uint8Array, n = 512) => Buffer.from(buf.subarray(0, n)).toString('latin1');
const startsWith = (buf: Uint8Array, bytes: number[]) => bytes.every((b, i) => buf[i] === b);

/** Signaturen van uitvoerbare bestanden die nooit geaccepteerd worden, ongeacht extensie. */
function looksExecutable(buf: Uint8Array) {
  return (
    startsWith(buf, [0x4d, 0x5a]) || // MZ (Windows PE)
    startsWith(buf, [0x7f, 0x45, 0x4c, 0x46]) || // ELF
    startsWith(buf, [0xcf, 0xfa, 0xed, 0xfe]) || // Mach-O
    startsWith(buf, [0x23, 0x21]) // #! script
  );
}

/**
 * Inhoud controleren op basis van de eerste bytes. Technische formaten hebben
 * vaak tekstuele headers; we controleren wat betrouwbaar te controleren is en
 * weigeren in elk geval bestanden die zich voordoen als iets anders.
 */
function contentMatches(ext: string, head: Uint8Array): boolean {
  const text = ascii(head).replace(/^﻿/, '').trimStart();
  switch (ext) {
    case 'pdf':
      return ascii(head, 1024).includes('%PDF-');
    case 'zip':
      return startsWith(head, [0x50, 0x4b, 0x03, 0x04]) || startsWith(head, [0x50, 0x4b, 0x05, 0x06]);
    case 'step':
    case 'stp':
      return text.startsWith('ISO-10303-21');
    case 'iges':
    case 'igs': {
      const firstLine = text.split(/\r?\n/)[0] ?? '';
      return firstLine.length >= 73 && firstLine[72] === 'S';
    }
    case 'dxf':
      return /^0\s*\r?\n\s*SECTION/.test(text) || text.startsWith('999') || text.startsWith('AutoCAD Binary DXF');
    case 'dwg':
      return text.startsWith('AC10') || text.startsWith('AC1.') || text.startsWith('AC2');
    case 'stl':
      return true; // binair STL heeft geen vaste signatuur; executables zijn al uitgesloten
    case 'x_t':
    case 'sat':
      return /^[\x09\x0a\x0d\x20-\x7e]*$/.test(ascii(head, 256));
    case 'x_b':
      return true;
    case 'png':
      return startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'jpg':
    case 'jpeg':
      return startsWith(head, [0xff, 0xd8, 0xff]);
    default:
      return false;
  }
}

export function checkFile(name: string, size: number, head: Uint8Array): FileCheck {
  const safeName = sanitizeFilename(name);
  const ext = extensionOf(safeName);
  if (!(uploadLimits.extensions as readonly string[]).includes(ext))
    return { ok: false, error: `"${safeName}" heeft een niet-toegestaan bestandstype.` };
  if (size <= 0) return { ok: false, error: `"${safeName}" is leeg.` };
  if (size > uploadLimits.maxFileBytes) return { ok: false, error: `"${safeName}" is groter dan ${uploadLimits.maxFileBytes / 1024 / 1024} MB.` };
  if (looksExecutable(head) || !contentMatches(ext, head))
    return { ok: false, error: `De inhoud van "${safeName}" komt niet overeen met een geldig .${ext}-bestand.` };
  return { ok: true, ext, safeName };
}
