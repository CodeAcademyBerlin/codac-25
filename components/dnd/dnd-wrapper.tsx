'use client';

import React from 'react';

interface DndWrapperProps {
    children: React.ReactNode;
}

export function DndWrapper({ children }: DndWrapperProps) {
    return (
        <>{children}</>
    );
}
