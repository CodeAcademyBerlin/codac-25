import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/auth-utils';

import { ChatInterface } from './components/chat-interface';

export default async function ChatPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin?callbackUrl=/lms/chat');
    }

    return (
        <div className="h-full flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-6">
                    <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <h1 className="text-xl font-semibold">AI Learning Assistant</h1>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                        Ask me anything about your courses and learning materials
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ChatInterface user={user} />
            </div>
        </div>
    );
}
