'use client'

import { useEffect } from 'react'

import { useHeader } from './header-provider'

export function HideHeader() {
    const { setHeaderVisible } = useHeader()

    useEffect(() => {
        // Hide header on mount
        setHeaderVisible(false)

        // Show header on unmount (when navigating away)
        return () => {
            setHeaderVisible(true)
        }
    }, [setHeaderVisible])

    return null
} 