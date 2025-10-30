
import { SignOutButton } from '@/components/auth/signout-button';
import { CodacLogo } from '@/components/codac-brand/codac-logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignOutPage() {
  return (
    <Card className='w-full p-10' >
      <CardHeader className='space-y-1 text-center'>
        <div className='flex justify-center mb-4'>
          <CodacLogo size="lg" useGradient />
        </div>
        <CardTitle className='text-2xl font-bold'>Sign Out</CardTitle>
        <CardDescription>
          Are you sure you want to sign out of your CODAC account?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignOutButton />
      </CardContent>
    </Card>
  );
}
