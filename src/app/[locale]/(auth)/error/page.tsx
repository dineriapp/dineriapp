'use client';

import { Locale } from '@/i18n/routing';
import { XCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

const messages: Record<Locale, { title: string; description: string }> = {
    en: {
        title: 'Something went wrong',
        description:
            "We're sorry for the inconvenience. Please try again or contact support if the issue persists.",
    },
    de: {
        title: 'Etwas ist schiefgelaufen',
        description:
            'Es tut uns leid für die Unannehmlichkeiten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht.',
    },
    es: {
        title: 'Algo salió mal',
        description:
            'Lamentamos los inconvenientes. Inténtalo de nuevo o contacta con soporte si el problema persiste.',
    },
    fr: {
        title: 'Une erreur est survenue',
        description:
            "Nous sommes désolés pour la gêne occasionnée. Veuillez réessayer ou contacter le support si le problème persiste.",
    },
    it: {
        title: 'Qualcosa è andato storto',
        description:
            "Ci scusiamo per l'inconveniente. Riprova o contatta l'assistenza se il problema persiste.",
    },
    nl: {
        title: 'Er is iets misgegaan',
        description:
            'Onze excuses voor het ongemak. Probeer het opnieuw of neem contact op met support als het probleem aanhoudt.',
    },
};

export default function ErrorPage() {
    const locale = useLocale() as Locale;
    const { title, description } = messages[locale] || messages.en;

    return (
        <div className="flex flex-col items-start justify-start py-4 text-start">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-semibold text-red-600">{title}</h1>
            <p className="mt-2 text-gray-600">{description}</p>
        </div>
    );
}
