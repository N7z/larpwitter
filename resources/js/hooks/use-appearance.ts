import { useCallback, useEffect, useState } from 'react';

type Appearance = 'light' | 'dark';

function applyAppearance(appearance: Appearance) {
    document.documentElement.classList.toggle('dark', appearance === 'dark');
}

export function initializeAppearance() {
    const saved = (localStorage.getItem('appearance') as Appearance | null) ?? 'light';
    applyAppearance(saved);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(
        () => (localStorage.getItem('appearance') as Appearance | null) ?? 'light',
    );

    const updateAppearance = useCallback((value: Appearance) => {
        setAppearance(value);
        localStorage.setItem('appearance', value);
        applyAppearance(value);
    }, []);

    useEffect(() => {
        applyAppearance(appearance);
    }, [appearance]);

    return { appearance, updateAppearance } as const;
}
