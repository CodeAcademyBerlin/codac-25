import { auth as nextAuth } from '@/lib/auth/auth';

// Thin wrapper around current session retrieval to allow swapping auth providers later
export async function getSession() {
    return nextAuth();
}

export type SessionUser = Awaited<ReturnType<typeof getSession>> extends { user: infer U }
    ? U
    : null;

