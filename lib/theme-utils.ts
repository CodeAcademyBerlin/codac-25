export const colorSchemes = [
    {
        name: 'default',
        label: 'Default',
        class: '',
        colors: ['#4F46E5', '#7C3AED'],
        description: 'Classic CODAC purple gradient',
    },
    {
        name: 'blue',
        label: 'Ocean Blue',
        class: 'theme-blue',
        colors: ['#0EA5E9', '#06B6D4'],
        description: 'Calming ocean blues for focused learning',
    },
    {
        name: 'green',
        label: 'Forest Green',
        class: 'theme-green',
        colors: ['#10B981', '#059669'],
        description: 'Natural greens for a refreshing experience',
    },
    {
        name: 'purple',
        label: 'Royal Purple',
        class: 'theme-purple',
        colors: ['#8B5CF6', '#A855F7'],
        description: 'Rich purples for creative inspiration',
    },
    {
        name: 'orange',
        label: 'Sunset Orange',
        class: 'theme-orange',
        colors: ['#F59E0B', '#EA580C'],
        description: 'Energizing oranges for motivation',
    },
    {
        name: 'rose',
        label: 'Rose Pink',
        class: 'theme-rose',
        colors: ['#EC4899', '#E11D48'],
        description: 'Warm rose tones for a friendly feel',
    },
] as const;

export type ColorScheme = typeof colorSchemes[number]['name'];

export const STORAGE_KEY = 'codac-color-scheme';

export function getStoredColorScheme(): ColorScheme {
    if (typeof window === 'undefined') return 'default';

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const isValid = colorSchemes.some(scheme => scheme.name === stored);
        return isValid ? (stored as ColorScheme) : 'default';
    } catch {
        return 'default';
    }
}

export function setStoredColorScheme(scheme: ColorScheme): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, scheme);
    } catch (error) {
        console.warn('Failed to store color scheme:', error);
    }
}

export function applyColorScheme(scheme: ColorScheme): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    const selectedScheme = colorSchemes.find(cs => cs.name === scheme);

    // Remove all theme classes
    colorSchemes.forEach(cs => {
        if (cs.class) html.classList.remove(cs.class);
    });

    // Apply new theme class
    if (selectedScheme?.class) {
        html.classList.add(selectedScheme.class);
    }

    // Store the preference
    setStoredColorScheme(scheme);
}

export function getColorSchemeInfo(scheme: ColorScheme) {
    return colorSchemes.find(cs => cs.name === scheme) || colorSchemes[0];
} 