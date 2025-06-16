import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h1 className="text-4xl font-bold text-primary">404: Page Not Found</h1>
                <p className="text-muted-foreground text-lg">Looks like this page got lost in the stack trace...</p>
                <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded">Error: Page undefined</code>
                    <span className="text-muted-foreground">at</span>
                    <code className="bg-muted px-2 py-1 rounded">404.notFound()</code>
                </div>
                <Link
                    href="/"
                    className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
                >
                    <span>Return to Homepage</span>
                    <span className="text-muted-foreground">// TODO: Fix this bug</span>
                </Link>
            </div>
        </div>
    )
}