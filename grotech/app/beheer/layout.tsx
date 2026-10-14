import type { Metadata } from 'next';
import { assertAdminEnabled } from '@/lib/server/admin-auth';

export const metadata: Metadata = { title: 'Beheer', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertAdminEnabled();
  return <div className="container-x pt-[calc(var(--header-h)+2.5rem)] pb-24">{children}</div>;
}
