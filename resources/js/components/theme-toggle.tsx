import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    return (
        <button
            type="button"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 ${className}`}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
