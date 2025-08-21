'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { AppBreadcrumb } from '@/components/app-breadcrumb';
import { ThemePicker } from '@/components/theme-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AppHeaderProps {
    showSidebarTrigger?: boolean;
}

export function AppHeader({
    showSidebarTrigger = true
}: AppHeaderProps) {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center gap-4">
                {showSidebarTrigger && (
                    <SidebarTrigger className="-ml-1" />
                )}
                <AppBreadcrumb />
            </div>

            <div className="flex items-center gap-2">
                <ThemePicker variant="dropdown" align="end" />
                
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={user.image || ''}
                                        alt={user.name || 'User'}
                                    />
                                    <AvatarFallback>
                                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <div className="flex items-center justify-start gap-2 p-2">
                                <div className="flex flex-col space-y-1 leading-none">
                                    {user.name && <p className="font-medium">{user.name}</p>}
                                    {user.email && (
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    )}
                                    {user.role && (
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {user.role.toLowerCase()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/auth/signout">
                                    <span>Sign out</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
} 