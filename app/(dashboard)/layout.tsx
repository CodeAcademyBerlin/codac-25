import { AppLayout } from '@/components/app-layout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getSession();
  // console.log('Dashboard layout session:', session);
  // if (!session?.session?.user) {
  //   redirect(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard')}`);
  // }
  return <AppLayout>{children}</AppLayout>;
}
