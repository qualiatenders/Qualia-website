import { quoteSchema, fieldErrors } from '@/lib/quote/schema';
import { uploadLimits } from '@/lib/quote/options';
import { verifyToken } from '@/lib/server/form-token';
import { checkFile } from '@/lib/server/files';
import { clientIp, ipKey, isSameOrigin, json } from '@/lib/server/request';
import { rateLimit, limits } from '@/lib/server/rate-limit';
import { createQuote, saveQuote } from '@/lib/server/storage';
import { sendQuoteMails } from '@/lib/server/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = uploadLimits.maxTotalBytes + 2 * 1024 * 1024; // bestanden + formuliervelden

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Verzoek geweigerd.' }, 403);

  const length = Number(req.headers.get('content-length') || 0);
  if (length > MAX_BODY) return json({ error: `De bestanden zijn samen groter dan ${uploadLimits.maxTotalBytes / 1024 / 1024} MB.` }, 413);

  const rl = rateLimit(`quote:${ipKey(clientIp(req))}`, limits.quote);
  if (!rl.ok)
    return json({ error: 'Je hebt kort na elkaar meerdere aanvragen verstuurd. Probeer het later opnieuw of neem telefonisch of per e-mail contact op.' }, 429, { 'retry-after': String(rl.retryAfter) });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'De aanvraag kon niet worden gelezen. Probeer het opnieuw.' }, 400);
  }

  // Honeypot: echte bezoekers zien dit veld niet. Bots krijgen een neutraal antwoord.
  if (String(form.get('website') ?? '').trim() !== '') return json({ ok: true, reference: null, confirmationSent: false });

  const token = verifyToken(form.get('token'), 'quote');
  if (!token.ok)
    return json(
      { error: token.reason === 'expired' ? 'Het formulier is verlopen. Vernieuw de pagina en verstuur opnieuw.' : 'De aanvraag kon niet worden gecontroleerd. Vernieuw de pagina en probeer het opnieuw.', code: `token-${token.reason}` },
      400,
    );

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get('payload') ?? ''));
  } catch {
    return json({ error: 'Ongeldige aanvraag.' }, 400);
  }
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Controleer de gemarkeerde velden.', fields: fieldErrors(parsed.error) }, 422);

  const entries = form.getAll('files').filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f);
  if (entries.length > uploadLimits.maxFiles) return json({ error: `Je kunt maximaal ${uploadLimits.maxFiles} bestanden uploaden.` }, 422);
  const total = entries.reduce((s, f) => s + f.size, 0);
  if (total > uploadLimits.maxTotalBytes) return json({ error: `De bestanden zijn samen groter dan ${uploadLimits.maxTotalBytes / 1024 / 1024} MB.` }, 413);

  const files: { name: string; ext: string; data: Buffer }[] = [];
  const fileErrors: string[] = [];
  for (const f of entries) {
    const data = Buffer.from(await f.arrayBuffer());
    const check = checkFile(f.name, data.length, data.subarray(0, 1024));
    if (!check.ok) fileErrors.push(check.error);
    else files.push({ name: check.safeName, ext: check.ext, data });
  }
  if (fileErrors.length) return json({ error: fileErrors.join(' '), fields: { files: fileErrors.join(' ') } }, 422);

  let record;
  try {
    record = await createQuote(parsed.data, files);
  } catch (e) {
    console.error(`[grotech] opslaan offerteaanvraag mislukt: ${(e as Error).message}`);
    return json({ error: 'Er ging iets mis bij het opslaan. Probeer het opnieuw of neem contact met ons op.' }, 500);
  }

  // Aanvraag staat veilig opgeslagen; e-mail mag falen zonder dat de aanvraag verloren gaat.
  try {
    record.mail = await sendQuoteMails(record);
    await saveQuote(record);
  } catch (e) {
    console.error(`[grotech] e-mail voor ${record.id} mislukt: ${(e as Error).message}`);
  }

  console.info(`[grotech] offerteaanvraag ${record.id} ontvangen (${files.length} bestand(en), mail: ${record.mail.notify}/${record.mail.confirmation})`);
  return json({ ok: true, reference: record.id, confirmationSent: record.mail.confirmation === 'sent', mailMode: record.mail.confirmation });
}
