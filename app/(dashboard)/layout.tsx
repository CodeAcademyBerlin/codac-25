import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { getSession } from '@/lib/auth/session';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent('/dashboard')}`);
  }
  return <AppLayout>{children}</AppLayout>;
}
