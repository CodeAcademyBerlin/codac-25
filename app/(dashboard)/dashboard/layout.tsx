import { PageContainer } from '@/components/layout';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <PageContainer>{children}</PageContainer>;
}
