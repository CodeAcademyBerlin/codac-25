'use client';

import { ArrowLeft, CheckCircle, Loader2, Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { addToWaitlist } from '@/actions/auth/waitlist';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WaitlistFormProps {
  email: string;
  onBack: () => void;
}

export function WaitlistForm({ email, onBack }: WaitlistFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('message', message);

      const result = await addToWaitlist(formData);

      if (result.success) {
        setIsSubmitted(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
            <CheckCircle className='h-6 w-6 text-green-600' />
          </div>
          <CardTitle className='text-2xl'>You're on the waitlist!</CardTitle>
          <CardDescription>
            We've added <strong>{email}</strong> to our waitlist. We'll notify
            you when access becomes available.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
            <div className='flex items-center space-x-2'>
              <Mail className='h-5 w-5 text-green-600' />
              <span className='text-sm font-medium text-green-900 dark:text-green-100'>
                Confirmation email sent
              </span>
            </div>
            <p className='mt-2 text-sm text-green-700 dark:text-green-300'>
              Check your inbox for more details about what happens next.
            </p>
          </div>

          <Button variant='outline' onClick={onBack} className='w-full'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Try Different Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl'>Join the Waitlist</CardTitle>
        <CardDescription>
          You're not currently registered as a Code Academy Berlin alumni, but
          you can join our waitlist for future access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              type='email'
              value={email}
              disabled
              className='bg-muted'
            />
            <p className='text-xs text-muted-foreground'>
              This email will be added to our waitlist
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name'>Name (Optional)</Label>
            <Input
              id='name'
              type='text'
              placeholder='Your name'
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='message'>Message (Optional)</Label>
            <Textarea
              id='message'
              placeholder="Tell us why you're interested in CODAC..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={isLoading}
              maxLength={500}
              rows={3}
            />
            <p className='text-xs text-muted-foreground'>
              {message.length}/500 characters
            </p>
          </div>

          <div className='space-y-3'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              <UserPlus className='mr-2 h-4 w-4' />
              Join Waitlist
            </Button>

            <Button
              type='button'
              variant='outline'
              onClick={onBack}
              className='w-full'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Use Different Email
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
