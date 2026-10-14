'use client';

import { useActionState } from 'react';
import { login } from '../actions';
import { inputClass } from '@/components/forms/Field';
import { Button } from '@/components/Button';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="user" className="mb-2 block text-sm font-bold">Gebruikersnaam</label>
        <input id="user" name="user" autoComplete="username" required className={inputClass} defaultValue={state?.user} key={state?.user ?? ''} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-bold">Wachtwoord</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} autoFocus={Boolean(state?.error)} />
      </div>
      {state?.error && <p className="text-sm font-bold text-[#ff6b77]" role="alert">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">{pending ? 'Inloggen…' : 'Inloggen'}</Button>
    </form>
  );
}
