
import { headers } from 'next/headers';

export async function getServerEditor() {
    const host = process.env.NEXT_PUBLIC_HOST;
    // `headers()` works in every server component / server action
    const url = `${host}/api/generate-doc`;

    const res = await fetch(url, { cache: 'no-store' });
    return res.json();
}