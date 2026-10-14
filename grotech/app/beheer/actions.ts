'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkCredentials, startSession, endSession, requireAdmin, requestIp } from '@/lib/server/admin-auth';
import { rateLimit, limits } from '@/lib/server/rate-limit';
import { ipKey } from '@/lib/server/request';
import { updateQuoteStatus, deleteQuote, deleteContact, quoteStatuses, type QuoteStatus } from '@/lib/server/storage';

export type LoginState = { error: string; user: string } | null;

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const user = String(form.get('user') ?? '').slice(0, 200);
  const rl = rateLimit(`login:${ipKey(await requestIp())}`, limits.login);
  if (!rl.ok) return { error: `Te veel pogingen. Probeer het over ${Math.ceil(rl.retryAfter / 60)} minuten opnieuw.`, user };
  const ok = checkCredentials(user, String(form.get('password') ?? ''));
  if (!ok) return { error: 'Onjuiste gebruikersnaam of wachtwoord.', user };
  await startSession();
  redirect('/beheer');
}

export async function logout() {
  await endSession();
  redirect('/beheer/login');
}

export async function setStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id') ?? '');
  const status = String(form.get('status') ?? '') as QuoteStatus;
  if (!quoteStatuses.includes(status)) return;
  await updateQuoteStatus(id, status);
  revalidatePath(`/beheer/aanvragen/${id}`);
  revalidatePath('/beheer');
}

export async function removeQuote(form: FormData) {
  await requireAdmin();
  if (form.get('confirm') !== 'ja') return;
  await deleteQuote(String(form.get('id') ?? ''));
  redirect('/beheer');
}

export async function removeContact(form: FormData) {
  await requireAdmin();
  await deleteContact(String(form.get('id') ?? ''));
  revalidatePath('/beheer');
}
