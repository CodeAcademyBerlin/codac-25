'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { signIn } from '@/lib/auth/auth'
import { AuthError } from 'next-auth'

const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
})

export async function signInWithEmail(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const callbackUrl = formData.get('callbackUrl') as string || '/'

    // Validate email
    const validatedFields = emailSchema.safeParse({ email })
    if (!validatedFields.success) {
        return {
            error: 'Invalid email address',
            success: false,
        }
    }

    try {
        await signIn('email', {
            email: validatedFields.data.email,
            redirectTo: callbackUrl,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'EmailSignInError':
                    return {
                        error: 'Failed to send email. Please check your email address.',
                        success: false,
                    }
                default:
                    return {
                        error: 'Something went wrong. Please try again.',
                        success: false,
                    }
            }
        }

        // If it's a redirect (successful sign-in), re-throw it
        throw error
    }

    // This shouldn't be reached if successful, but just in case
    redirect('/auth/verify-request')
}

export async function signInWithGoogle(prevState: any, formData: FormData) {
    const callbackUrl = formData.get('callbackUrl') as string || '/'

    try {
        await signIn('google', {
            redirectTo: callbackUrl,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'OAuthSignInError':
                case 'OAuthCallbackError':
                    return {
                        error: 'Failed to sign in with Google. Please try again.',
                        success: false,
                    }
                default:
                    return {
                        error: 'Something went wrong. Please try again.',
                        success: false,
                    }
            }
        }

        // If it's a redirect (successful sign-in), re-throw it
        throw error
    }
} 