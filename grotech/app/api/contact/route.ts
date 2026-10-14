import { contactSchema, fieldErrors } from '@/lib/quote/schema';
import { verifyToken } from '@/lib/server/form-token';
import { clientIp, ipKey, isSameOrigin, json } from '@/lib/server/request';
import { rateLimit, limits } from '@/lib/server/rate-limit';
import { createContact, saveContact } from '@/lib/server/storage';
import { sendContactMail } from '@/lib/server/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Verzoek geweigerd.' }, 403);
  if (Number(req.headers.get('content-length') || 0) > 64 * 1024) return json({ error: 'Bericht te groot.' }, 413);

  const rl = rateLimit(`contact:${ipKey(clientIp(req))}`, limits.contact);
  if (!rl.ok) return json({ error: 'Je hebt kort na elkaar meerdere berichten verstuurd. Probeer het later opnieuw.' }, 429, { 'retry-after': String(rl.retryAfter) });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Ongeldig verzoek.' }, 400);
  }
  if (String(body.website ?? '').trim() !== '') return json({ ok: true });

  const token = verifyToken(body.token, 'contact');
  if (!token.ok) return json({ error: 'Het formulier kon niet worden gecontroleerd. Vernieuw de pagina en probeer het opnieuw.', code: `token-${token.reason}` }, 400);

  const parsed = contactSchema.safeParse(body.payload);
  if (!parsed.success) return json({ error: 'Controleer de gemarkeerde velden.', fields: fieldErrors(parsed.error) }, 422);

  let record;
  try {
    record = await createContact(parsed.data);
  } catch (e) {
    console.error(`[grotech] opslaan contactbericht mislukt: ${(e as Error).message}`);
    return json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, 500);
  }
  try {
    record.mail.notify = await sendContactMail(record);
    await saveContact(record);
  } catch (e) {
    console.error(`[grotech] e-mail voor ${record.id} mislukt: ${(e as Error).message}`);
  }
  console.info(`[grotech] contactbericht ${record.id} ontvangen (mail: ${record.mail.notify})`);
  return json({ ok: true, reference: record.id });
}
