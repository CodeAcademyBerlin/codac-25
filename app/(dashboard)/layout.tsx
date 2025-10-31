import { AppLayout } from '@/components/app-layout';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard')}`);
  }
  return <AppLayout>{children}</AppLayout>;
}
