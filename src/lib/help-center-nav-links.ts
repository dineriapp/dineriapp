
import { BookOpen, Boxes, LifeBuoy, Sparkles, type LucideIcon } from "lucide-react";

export const navMain: Record<
    "en" | "de" | "es" | "fr" | "it" | "nl",
    {
        title: string;
        icon?: LucideIcon;
        items?: {
            title: string;
            url: string;
        }[];
    }[]
> = {
    en: [
        {
            title: "Introduction",
            icon: BookOpen,
            items: [
                {
                    title: "Why use this platform?",
                    url: "/help-center/introduction#why-use-this-platform",
                },
                {
                    title: "Who is it for?",
                    url: "/help-center/introduction#who-is-it-for",
                },
                {
                    title: "Key Points to Remember",
                    url: "/help-center/introduction#key-Points-to-remember",
                },
            ],
        },
        {
            title: "What’s New?",
            icon: Sparkles,
            items: [
                {
                    title: "New Features",
                    url: "/help-center/what-is-new#new-features",
                },
                {
                    title: "Improvements",
                    url: "/help-center/what-is-new#improvements",
                },
                {
                    title: "Coming Soon",
                    url: "/help-center/what-is-new#coming-soon",
                },
            ],
        },
        {
            title: "Features",
            icon: Boxes,
            items: [
                {
                    title: "Analytics",
                    url: "/help-center/features#analytics",
                },
                {
                    title: "Orders",
                    url: "/help-center/features#orders",
                },
                {
                    title: "Links",
                    url: "/help-center/features#links",
                },
                {
                    title: "Menu",
                    url: "/help-center/features#menu",
                },
                {
                    title: "Events",
                    url: "/help-center/features#events",
                },
                {
                    title: "FAQ",
                    url: "/help-center/features#faq",
                },
                {
                    title: "Popups",
                    url: "/help-center/features#popups",
                },
                {
                    title: "QR Codes",
                    url: "/help-center/features#qr-codes",
                },
            ],
        },
        {
            title: "Contact Us",
            icon: LifeBuoy,
            items: [
                {
                    title: "Get Help",
                    url: "/help-center/support",
                },
            ],
        }
    ],
    de: [
        {
            title: "Einführung",
            icon: BookOpen,
            items: [
                {
                    title: "Warum diese Plattform nutzen?",
                    url: "/help-center/introduction#why-use-this-platform",
                },
                {
                    title: "Für wen ist es gedacht?",
                    url: "/help-center/introduction#who-is-it-for",
                },
                {
                    title: "Wichtige Punkte zum Merken",
                    url: "/help-center/introduction#key-Points-to-remember",
                },
            ],
        },
        {
            title: "Was ist neu?",
            icon: Sparkles,
            items: [
                {
                    title: "Neue Funktionen",
                    url: "/help-center/what-is-new#new-features",
                },
                {
                    title: "Verbesserungen",
                    url: "/help-center/what-is-new#improvements",
                },
                {
                    title: "Demnächst verfügbar",
                    url: "/help-center/what-is-new#coming-soon",
                },
            ],
        },
        {
            title: "Funktionen",
            icon: Boxes,
            items: [
                {
                    title: "Analysen",
                    url: "/help-center/features#analytics",
                },
                {
                    title: "Bestellungen",
                    url: "/help-center/features#orders",
                },
                {
                    title: "Links",
                    url: "/help-center/features#links",
                },
                {
                    title: "Menü",
                    url: "/help-center/features#menu",
                },
                {
                    title: "Veranstaltungen",
                    url: "/help-center/features#events",
                },
                {
                    title: "FAQ",
                    url: "/help-center/features#faq",
                },
                {
                    title: "Pop-ups",
                    url: "/help-center/features#popups",
                },
                {
                    title: "QR-Codes",
                    url: "/help-center/features#qr-codes",
                },
            ],
        },
        {
            title: "Kontakt",
            icon: LifeBuoy,
            items: [
                {
                    title: "Hilfe erhalten",
                    url: "/help-center/support",
                },
            ],
        },
    ],
    es: [
        {
            title: "Introducción",
            icon: BookOpen,
            items: [
                {
                    title: "¿Por qué usar esta plataforma?",
                    url: "/help-center/introduction#why-use-this-platform",
                },
                {
                    title: "¿Para quién es?",
                    url: "/help-center/introduction#who-is-it-for",
                },
                {
                    title: "Puntos clave a recordar",
                    url: "/help-center/introduction#key-Points-to-remember",
                },
            ],
        },
        {
            title: "¿Qué hay de nuevo?",
            icon: Sparkles,
            items: [
                {
                    title: "Nuevas funciones",
                    url: "/help-center/what-is-new#new-features",
                },
                {
                    title: "Mejoras",
                    url: "/help-center/what-is-new#improvements",
                },
                {
                    title: "Próximamente",
                    url: "/help-center/what-is-new#coming-soon",
                },
            ],
        },
        {
            title: "Funciones",
            icon: Boxes,
            items: [
                {
                    title: "Analíticas",
                    url: "/help-center/features#analytics",
                },
                {
                    title: "Pedidos",
                    url: "/help-center/features#orders",
                },
                {
                    title: "Enlaces",
                    url: "/help-center/features#links",
                },
                {
                    title: "Menú",
                    url: "/help-center/features#menu",
                },
                {
                    title: "Eventos",
                    url: "/help-center/features#events",
                },
                {
                    title: "Preguntas frecuentes",
                    url: "/help-center/features#faq",
                },
                {
                    title: "Popups",
                    url: "/help-center/features#popups",
                },
                {
                    title: "Códigos QR",
                    url: "/help-center/features#qr-codes",
                },
            ],
        },
        {
            title: "Contáctanos",
            icon: LifeBuoy,
            items: [
                {
                    title: "Obtener ayuda",
                    url: "/help-center/support",
                },
            ],
        },
    ],
    fr: [
        {
            title: "Introduction",
            icon: BookOpen,
            items: [
                {
                    title: "Pourquoi utiliser cette plateforme ?",
                    url: "/help-center/introduction#why-use-this-platform",
                },
                {
                    title: "À qui s'adresse-t-elle ?",
                    url: "/help-center/introduction#who-is-it-for",
                },
                {
                    title: "Points clés à retenir",
                    url: "/help-center/introduction#key-Points-to-remember",
                },
            ],
        },
        {
            title: "Quoi de neuf ?",
            icon: Sparkles,
            items: [
                {
                    title: "Nouvelles fonctionnalités",
                    url: "/help-center/what-is-new#new-features",
                },
                {
                    title: "Améliorations",
                    url: "/help-center/what-is-new#improvements",
                },
                {
                    title: "À venir",
                    url: "/help-center/what-is-new#coming-soon",
                },
            ],
        },
        {
            title: "Fonctionnalités",
            icon: Boxes,
            items: [
                {
                    title: "Analyses",
                    url: "/help-center/features#analytics",
                },
                {
                    title: "Commandes",
                    url: "/help-center/features#orders",
                },
                {
                    title: "Liens",
                    url: "/help-center/features#links",
                },
                {
                    title: "Menu",
                    url: "/help-center/features#menu",
                },
                {
                    title: "Événements",
                    url: "/help-center/features#events",
                },
                {
                    title: "FAQ",
                    url: "/help-center/features#faq",
                },
                {
                    title: "Popups",
                    url: "/help-center/features#popups",
                },
                {
                    title: "Codes QR",
                    url: "/help-center/features#qr-codes",
                },
            ],
        },
        {
            title: "Contactez-nous",
            icon: LifeBuoy,
            items: [
                {
                    title: "Obtenir de l'aide",
                    url: "/help-center/support",
                },
            ],
        },
    ],
    it: [
        {
            title: "Introduzione",
            icon: BookOpen,
            items: [
                {
                    title: "Perché usare questa piattaforma?",
                    url: "/help-center/introduction#why-use-this-platform",
                },
                {
                    title: "A chi è destinata?",
                    url: "/help-center/introduction#who-is-it-for",
                },
                {
                    title: "Punti chiave da ricordare",
                    url: "/help-center/introduction#key-Points-to-remember",
                },
            ],
        },
        {
            title: "Novità",
            icon: Sparkles,
            items: [
                {
                    title: "Nuove funzionalità",
                    url: "/help-center/what-is-new#new-features",
                },
                {
                    title: "Miglioramenti",
                    url: "/help-center/what-is-new#improvements",
                },
                {
                    title: "Prossimamente",
                    url: "/help-center/what-is-new#coming-soon",
                },
            ],
        },
        {
            title: "Funzionalità",
            icon: Boxes,
            items: [
                {
                    title: "Analisi",
                    url: "/help-center/features#analytics",
                },
                {
                    title: "Ordini",
                    url: "/help-center/features#orders",
                },
                {
                    title: "Link",
                    url: "/help-center/features#links",
                },
                {
                    title: "Menu",
                    url: "/help-center/features#menu",
                },
                {
                    title: "Eventi",
                    url: "/help-center/features#events",
                },
                {
                    title: "FAQ",
                    url: "/help-center/features#faq",
                },
                {
                    title: "Pop-up",
                    url: "/help-center/features#popups",
                },
                {
                    title: "Codici QR",
                    url: "/help-center/features#qr-codes",
                },
            ],
        },
        {
            title: "Contattaci",
            icon: LifeBuoy,
            items: [
                {
                    title: "Richiedi aiuto",
                    url: "/help-center/support",
                },
            ],
        },
    ],
    nl: [
        {
            title: "Introductie",
            icon: BookOpen,
            items: [
                {
                    title: "Waarom dit platform gebruiken?",
                    url: "/help-center/introduction#why-use-this-platform",
                },
                {
                    title: "Voor wie is het bedoeld?",
                    url: "/help-center/introduction#who-is-it-for",
                },
                {
                    title: "Belangrijke punten om te onthouden",
                    url: "/help-center/introduction#key-Points-to-remember",
                },
            ],
        },
        {
            title: "Wat is er nieuw?",
            icon: Sparkles,
            items: [
                {
                    title: "Nieuwe functies",
                    url: "/help-center/what-is-new#new-features",
                },
                {
                    title: "Verbeteringen",
                    url: "/help-center/what-is-new#improvements",
                },
                {
                    title: "Binnenkort beschikbaar",
                    url: "/help-center/what-is-new#coming-soon",
                },
            ],
        },
        {
            title: "Functies",
            icon: Boxes,
            items: [
                {
                    title: "Analyses",
                    url: "/help-center/features#analytics",
                },
                {
                    title: "Bestellingen",
                    url: "/help-center/features#orders",
                },
                {
                    title: "Links",
                    url: "/help-center/features#links",
                },
                {
                    title: "Menu",
                    url: "/help-center/features#menu",
                },
                {
                    title: "Evenementen",
                    url: "/help-center/features#events",
                },
                {
                    title: "FAQ",
                    url: "/help-center/features#faq",
                },
                {
                    title: "Pop-ups",
                    url: "/help-center/features#popups",
                },
                {
                    title: "QR-codes",
                    url: "/help-center/features#qr-codes",
                },
            ],
        },
        {
            title: "Contact opnemen",
            icon: LifeBuoy,
            items: [
                {
                    title: "Hulp krijgen",
                    url: "/help-center/support",
                },
            ],
        },
    ]

};