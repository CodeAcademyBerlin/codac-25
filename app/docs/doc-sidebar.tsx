import Link from 'next/link';
import { getDocs } from '@/data/docs';

export async function DocSidebar() {
    const docs = await getDocs();

    return (
        <aside className="w-64 border-r h-screen p-4 overflow-y-auto">
            <nav>
                <ul className="space-y-2">
                    {docs.map((doc) => (
                        <li key={doc.id}>
                            <Link
                                href={`/docs/${doc.id}`}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {doc.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
