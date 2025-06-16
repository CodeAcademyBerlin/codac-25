/**
 * Theme Picker Component for CODAC
 * 
 * A comprehensive theme customization component that allows users to:
 * - Switch between light, dark, and system themes
 * - Choose from multiple color schemes (default, blue, green, purple, orange, rose)
 * - Persist theme preferences in localStorage
 * 
 * Usage:
 * ```tsx
 * // Dropdown variant (compact)
 * <ThemePicker variant="dropdown" align="end" />
 * 
 * // Popover variant (expanded with visual previews)
 * <ThemePicker variant="popover" align="center" />
 * ```
 * 
 * Features:
 * - SSR-safe with proper hydration handling
 * - Automatic persistence of theme preferences
 * - Visual color previews for each scheme
 * - Accessible with proper ARIA labels
 * - Responsive design for mobile and desktop
 */

'use client';

import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useMounted } from '@/hooks/use-mounted';
import { colorSchemes, getStoredColorScheme, applyColorScheme, type ColorScheme } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';

const themes = [
    {
        name: 'light',
        label: 'Light',
        icon: Sun,
    },
    {
        name: 'dark',
        label: 'Dark',
        icon: Moon,
    },
    {
        name: 'system',
        label: 'System',
        icon: Monitor,
    },
];

interface ThemePickerProps {
    variant?: 'dropdown' | 'popover';
    align?: 'center' | 'end' | 'start';
}

export function ThemePicker({ variant = 'dropdown', align = 'end' }: ThemePickerProps) {
    const { theme, setTheme } = useTheme();
    const [colorScheme, setColorScheme] = React.useState<ColorScheme>('default');
    const mounted = useMounted();

    React.useEffect(() => {
        const savedScheme = getStoredColorScheme();
        setColorScheme(savedScheme);
        applyColorScheme(savedScheme);
    }, []);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
    };

    const handleColorSchemeChange = (scheme: ColorScheme) => {
        setColorScheme(scheme);
        applyColorScheme(scheme);
    };

    // Always render the same structure to avoid hydration mismatch
    const ThemeIcon = !mounted ? Sun : (theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor);

    if (variant === 'popover') {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThemeIcon className="h-4 w-4" />
                        <span className="sr-only">Customize theme</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align={align}>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium leading-none mb-2">Theme Mode</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {themes.map((t) => {
                                    const Icon = t.icon;
                                    return (
                                        <Button
                                            key={t.name}
                                            variant={theme === t.name ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleThemeChange(t.name)}
                                            className="flex flex-col gap-1 h-auto py-2"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="text-xs">{t.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium leading-none mb-2">Color Scheme</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {colorSchemes.map((scheme) => (
                                    <Button
                                        key={scheme.name}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleColorSchemeChange(scheme.name)}
                                        className={cn(
                                            "flex items-center justify-between h-auto py-2 px-3",
                                            colorScheme === scheme.name && "border-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                {scheme.colors.map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="h-3 w-3 rounded-full border border-border/50"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs">{scheme.label}</span>
                                        </div>
                                        {colorScheme === scheme.name && (
                                            <Check className="h-3 w-3 text-primary" />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ThemeIcon className="h-4 w-4" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="w-48">
                <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {themes.map((t) => {
                    const Icon = t.icon;
                    return (
                        <DropdownMenuItem
                            key={t.name}
                            onClick={() => handleThemeChange(t.name)}
                            className="flex items-center gap-2"
                        >
                            <Icon className="h-4 w-4" />
                            <span>{t.label}</span>
                            {theme === t.name && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Color Schemes
                </DropdownMenuLabel>

                {colorSchemes.map((scheme) => (
                    <DropdownMenuItem
                        key={scheme.name}
                        onClick={() => handleColorSchemeChange(scheme.name)}
                        className="flex items-center gap-2"
                    >
                        <div className="flex gap-1">
                            {scheme.colors.map((color, index) => (
                                <div
                                    key={index}
                                    className="h-3 w-3 rounded-full border border-border/50"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <span className="text-sm">{scheme.label}</span>
                        {colorScheme === scheme.name && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 