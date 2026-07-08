import { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function TextField({ label, error, className = '', ...props }: TextFieldProps) {
    return (
        <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                {...props}
                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${className}`}
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
