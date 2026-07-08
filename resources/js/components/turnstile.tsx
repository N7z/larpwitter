import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: Record<string, unknown>) => string;
            remove: (widgetId: string) => void;
        };
    }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
    error?: string;
}

export default function Turnstile({ siteKey, onVerify, error }: TurnstileProps) {
    const container = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const onVerifyRef = useRef(onVerify);
    onVerifyRef.current = onVerify;

    useEffect(() => {
        let cancelled = false;

        function renderWidget() {
            if (cancelled || !window.turnstile || !container.current) return;

            widgetId.current = window.turnstile.render(container.current, {
                sitekey: siteKey,
                size: 'flexible',
                callback: (token: string) => onVerifyRef.current(token),
            });
        }

        if (window.turnstile) {
            renderWidget();
        } else {
            const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);

            if (existing) {
                existing.addEventListener('load', renderWidget);
            } else {
                const script = document.createElement('script');
                script.src = SCRIPT_SRC;
                script.async = true;
                script.defer = true;
                script.addEventListener('load', renderWidget);
                document.head.appendChild(script);
            }
        }

        return () => {
            cancelled = true;
            if (widgetId.current && window.turnstile) {
                window.turnstile.remove(widgetId.current);
            }
        };
    }, [siteKey]);

    return (
        <div className="mb-4 w-full">
            <div ref={container} className="w-full" />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
