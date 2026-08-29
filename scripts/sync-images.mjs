/**
 * Scant public/images/ en schrijft lib/media-manifest.json: een mapping van
 * bestandsnaam (zonder extensie) naar publiek pad.
 *
 * Hierdoor hoeft er geen code aangepast te worden om beeld toe te voegen —
 * zet een bestand met de juiste naam in public/images/ en de site pakt het op.
 * Draait automatisch via `prebuild`, of handmatig met `npm run sync:images`.
 */
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, basename, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(ROOT, 'public', 'images');
const MANIFEST = join(ROOT, 'lib', 'media-manifest.json');

const EXTENSIONS = ['.avif', '.webp', '.jpg', '.jpeg', '.png'];
// Eerst in deze volgorde: het modernste formaat wint bij dubbele namen.
const rank = (ext) => EXTENSIONS.indexOf(ext.toLowerCase());

function walk(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out = out.concat(walk(full));
    else out.push(full);
  }
  return out;
}

const manifest = {};
const skipped = [];

for (const file of walk(IMAGES)) {
  const ext = extname(file);
  if (rank(ext) === -1) {
    if (ext && ext !== '.md') skipped.push(basename(file));
    continue;
  }
  const key = basename(file, ext);
  const publicPath = '/' + relative(join(ROOT, 'public'), file).split(/[\\/]/).join('/');
  const existing = manifest[key];
  if (!existing || rank(ext) < rank(extname(existing))) manifest[key] = publicPath;
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

const found = Object.keys(manifest);
console.log(`[images] ${found.length} bestand(en) gekoppeld${found.length ? ': ' + found.join(', ') : ''}`);
if (skipped.length) console.log(`[images] overgeslagen (geen ondersteund formaat): ${skipped.join(', ')}`);
