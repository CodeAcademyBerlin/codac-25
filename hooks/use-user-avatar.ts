import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UseUserAvatarReturn {
    avatar: string | null;
    isLoading: boolean;
    error: string | null;
}

export function useUserAvatar(): UseUserAvatarReturn {
    const { data: session } = useSession();
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user?.id) {
            setAvatar(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Fetch avatar from API
        fetch(`/api/user/avatar/${session.user.id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch avatar');
                }
                return response.json();
            })
            .then(data => {
                setAvatar(data.avatar || null);
            })
            .catch(err => {
                console.error('Error fetching avatar:', err);
                setError(err.message);
                setAvatar(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [session?.user?.id]);

    return { avatar, isLoading, error };
} 