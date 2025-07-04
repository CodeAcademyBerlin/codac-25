'use client';

import { BookOpen, GraduationCap, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LMSNavbarProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        avatar?: string | null;
        role: string;
    };
}

const navigation = [
    { name: 'Dashboard', href: '/lms', icon: BookOpen },
    { name: 'My Courses', href: '/learning', icon: GraduationCap },
];

export function LMSNavbar({ user }: LMSNavbarProps) {
    const pathname = usePathname();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
                <div className="flex items-center space-x-6">
                    <Link href="/lms" className="flex items-center space-x-2">
                        <GraduationCap className="h-6 w-6" />
                        <span className="font-bold">LMS</span>
                    </Link>

                    <div className="flex space-x-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <Button
                                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            'h-8',
                                            pathname === item.href && 'bg-muted'
                                        )}
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={user.avatar || user.image || ''}
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
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {user.role.toLowerCase()}
                                    </p>
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
                </div>
            </div>
        </nav>
    );
} 