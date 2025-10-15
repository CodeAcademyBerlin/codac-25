import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | CODAC',
  description:
    'Celebrate the achievements of our graduates and stay connected with the CODAC alumni community.',
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='min-h-screen bg-background'>{children}</div>;
}
