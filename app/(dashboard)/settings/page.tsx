import AccountSwitcher from '@/components/auth/account-switch';
import { PageContainer, PageHeader, Section } from '@/components/layout';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { OrganizationCard } from './organization-card';
import UserCard from './user-card';

export default async function SettingsPage() {
  const [session, activeSessions, deviceSessions, organization] =
    await Promise.all([
      auth.api.getSession({
        headers: await headers(),
      }),
      auth.api.listSessions({
        headers: await headers(),
      }),
      auth.api.listDeviceSessions({
        headers: await headers(),
      }),
      auth.api.getFullOrganization({
        headers: await headers(),
      }),
    ]).catch(e => {
      console.log(e);
      throw redirect('/sign-in');
    });
  return (
    <PageContainer size='lg'>
      <PageHeader
        title='Settings'
        description='Manage your account, sessions, and organization settings'
        size='lg'
      />

      <Section>
        <div className='flex gap-6 flex-col'>
          <AccountSwitcher
            sessions={JSON.parse(JSON.stringify(deviceSessions))}
          />
          <UserCard
            session={JSON.parse(JSON.stringify(session))}
            activeSessions={JSON.parse(JSON.stringify(activeSessions))}
          />
          <OrganizationCard
            session={JSON.parse(JSON.stringify(session))}
            activeOrganization={JSON.parse(JSON.stringify(organization))}
          />
        </div>
      </Section>
    </PageContainer>
  );
}
