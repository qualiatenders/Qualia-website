import { z } from 'zod';
import { techniqueIds, materialIds, surfaceIds } from './options';

const text = (max: number) => z.string().trim().max(max, `Maximaal ${max} tekens.`);

/** Vandaag in Nederlandse tijd als YYYY-MM-DD (voor de minimale leverdatum). */
export function todayIso() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export const stepTechniqueSchema = z.object({
  techniques: z.array(z.enum(techniqueIds)).min(1, 'Kies minimaal één productietechniek.').max(techniqueIds.length),
});

const specsBase = z.object({
  material: z.enum(materialIds, { errorMap: () => ({ message: 'Kies een materiaal.' }) }),
  materialDetail: text(200).default(''),
  quantity: z.coerce
    .number({ invalid_type_error: 'Vul een aantal in.' })
    .int('Vul een heel aantal in.')
    .min(1, 'Het aantal is minimaal 1.')
    .max(1_000_000, 'Neem voor zeer grote aantallen direct contact op.'),
  surface: z.enum(surfaceIds, { errorMap: () => ({ message: 'Kies een optie.' }) }),
  surfaceDetail: text(200).default(''),
  tolerances: text(1000).default(''),
  deliveryDate: z.string().trim().default(''),
  deliveryFlexible: z.boolean().default(false),
  remarks: text(4000).default(''),
});

type SpecsLike = { material?: string; materialDetail?: string; surface?: string; surfaceDetail?: string; deliveryDate?: string; deliveryFlexible?: boolean };

/** Regels die van meerdere velden afhangen. Los aanroepbaar, zodat de UI alle fouten tegelijk toont. */
export function specsCrossFieldErrors(v: SpecsLike): Record<string, string> {
  const out: Record<string, string> = {};
  const md = (v.materialDetail ?? '').trim();
  const sd = (v.surfaceDetail ?? '').trim();
  const date = (v.deliveryDate ?? '').trim();
  if ((v.material === 'anders' || v.material === 'meerdere') && md.length < 2) out.materialDetail = 'Licht het materiaal kort toe.';
  if (v.surface === 'anders' && sd.length < 2) out.surfaceDetail = 'Omschrijf de gewenste behandeling.';
  if (!v.deliveryFlexible) {
    if (!date) out.deliveryDate = 'Kies een datum of vink "flexibel" aan.';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) out.deliveryDate = 'Ongeldige datum.';
    else if (date < todayIso()) out.deliveryDate = 'Kies een datum in de toekomst.';
  }
  return out;
}

export const stepSpecsSchema = specsBase.superRefine((v, ctx) => {
  for (const [path, message] of Object.entries(specsCrossFieldErrors(v))) ctx.addIssue({ code: 'custom', path: [path], message });
});

/** Alle fouten van stap 2 in één keer (basis + afhankelijke regels). */
export function specsErrors(v: unknown): Record<string, string> {
  const base = specsBase.safeParse(v);
  return { ...specsCrossFieldErrors(v as SpecsLike), ...(base.success ? {} : fieldErrors(base.error)) };
}

export const stepContactSchema = z.object({
  company: text(160).min(2, 'Vul de bedrijfsnaam in.'),
  contactName: text(120).min(2, 'Vul je naam in.'),
  email: z.string().trim().max(254).email('Vul een geldig e-mailadres in.'),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\d\s./-]{8,24}$/, 'Vul een geldig telefoonnummer in.')
    .refine((v) => (v.match(/\d/g) ?? []).length >= 8, 'Vul een geldig telefoonnummer in.'),
  reference: text(80).default(''),
  extra: text(2000).default(''),
  privacy: z.literal(true, { errorMap: () => ({ message: 'Ga akkoord met de verwerking van je gegevens.' }) }),
});

export const quoteSchema = z.object({}).merge(stepTechniqueSchema).and(stepSpecsSchema).and(stepContactSchema);

export type QuotePayload = z.infer<typeof quoteSchema>;

export const contactSchema = z.object({
  name: text(120).min(2, 'Vul je naam in.'),
  company: text(160).default(''),
  email: z.string().trim().max(254).email('Vul een geldig e-mailadres in.'),
  phone: z
    .string()
    .trim()
    .max(24)
    .default('')
    .refine((v) => v === '' || (/^[+()\d\s./-]{8,24}$/.test(v) && (v.match(/\d/g) ?? []).length >= 8), 'Vul een geldig telefoonnummer in.'),
  subject: text(160).default(''),
  message: text(4000).min(10, 'Je bericht is te kort.'),
  privacy: z.literal(true, { errorMap: () => ({ message: 'Ga akkoord met de verwerking van je gegevens.' }) }),
});
export type ContactPayload = z.infer<typeof contactSchema>;

/** Zet zod-fouten om naar { veld: melding } voor de UI. */
export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
