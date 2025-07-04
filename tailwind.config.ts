import type { Config } from "tailwindcss";

export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'codac-brand': ['var(--font-codac-brand)'],
            },
            backgroundImage: {
                'gradient-codac': 'linear-gradient(1.66deg, #E77096 1.52%, #52EACE 89.2%)',
            },
            // Line clamp is now built-in to Tailwind CSS v3.3+
        }
    }
} satisfies Config; 