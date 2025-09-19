'use client';

import { XCircle } from 'lucide-react';

export default function ErrorPage() {
    return (
        <div className="flex flex-col items-start justify-start py-4 text-start">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-semibold text-red-600">Something went wrong</h1>
            <p className="mt-2 text-gray-600">
                We&apos;re sorry for the inconvenience. Please try again or contact support if the issue persists.
            </p>
        </div>
    );
}
