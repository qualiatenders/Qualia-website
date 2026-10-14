import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/server/admin-auth';
import { LoginForm } from './LoginForm';
import { Icon } from '@/components/Icon';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/beheer');
  return (
    <div className="mx-auto max-w-sm py-10">
      <Icon name="lock" size={32} className="text-red" />
      <h1 className="mt-6 text-3xl text-offwhite">Beheer</h1>
      <p className="mt-2 mb-8 text-mist">Alleen voor medewerkers van GROTECH.</p>
      <LoginForm />
    </div>
  );
}
