'use client';

import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ConfettiProps {
    trigger?: boolean;
    onComplete?: () => void;
}

export function Confetti({ trigger = false, onComplete }: ConfettiProps) {
    useEffect(() => {
        if (trigger) {
            fireConfetti();
            onComplete?.();
        }
    }, [trigger, onComplete]);

    return null;
}

// Utility functions for different confetti effects
export const fireConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from left
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });

        // Fire from right
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
};

export const fireSchoolPride = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 1000,
    };

    function fire(particleRatio: number, opts: any) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], // Blue, green, yellow, red
    });

    fire(0.2, {
        spread: 60,
        colors: ['#8B5CF6', '#06B6D4', '#84CC16'], // Purple, cyan, lime
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#EC4899', '#F97316', '#14B8A6'], // Pink, orange, teal
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#6366F1', '#22C55E', '#FBBF24'], // Indigo, green, amber
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#DC2626', '#7C3AED', '#059669'], // Red, violet, emerald
    });
};

export const fireCelebration = () => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from different positions
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        });

        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'],
        });
    }, 250);
};

// Hook for triggering confetti
export const useConfetti = () => {
    const celebrate = () => {
        fireCelebration();
    };

    const schoolPride = () => {
        fireSchoolPride();
    };

    const basic = () => {
        fireConfetti();
    };

    return { celebrate, schoolPride, basic };
}; 