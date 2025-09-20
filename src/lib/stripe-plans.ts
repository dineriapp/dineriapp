
export const STRIPE_PLANS = {
    basic: {
        name: "Basic",
        price: 0,
        description: "Perfect for small restaurants just getting started online",
        priceId: null,
        features: [
            "4 Links",
            "4 Menu Categories",
            "3 Menu Items per Category",
            "3 Events",
            "4 FAQ Categories",
            "2 FAQs per Category",
            "Basic Analytics",
            "QR Code Generation",
        ],
        limits: {
            links: 4,
            menuCategories: 2,
            menuItemsPerCategory: 2,
            events: 3,
            faqCategories: 2,
            faqsPerCategory: 2,
            qr_codes: 0,
        },
    },
    pro: {
        name: "Pro",
        description: "Most popular for established restaurants",
        price: 19,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
            "Unlimited Links",
            "Unlimited Menu Categories",
            "Unlimited Menu Items",
            "Unlimited Events",
            "Unlimited FAQ Categories",
            "Unlimited FAQs",
            "Advanced Analytics",
            "Custom Branding",
            "Priority Support",
            "Advanced QR Codes",
        ],
        limits: null,
    },
    enterprise: {
        name: "Enterprise",
        description: "For restaurant groups and franchises",
        price: 49,
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        features: [
            "Everything in Pro",
            "White Label Solution",
            "API Access",
            "Custom Integrations",
            "Dedicated Support",
            "Advanced Security",
            "Custom Domain",
            "Bulk Operations",
        ],
        limits: null,
    },
} as const

export type StripePlan = keyof typeof STRIPE_PLANS


export function isValidPlan(plan: string): plan is StripePlan {
    return plan in STRIPE_PLANS
}


type ResourceType =
    | "links"
    | "menu_categories"
    | "menu_items"
    | "events"
    | "faq_categories"
    | "faqs"
    | "qr_codes";

interface CheckLimitInput {
    userPlan: StripePlan;
    resourceType: ResourceType;
    currentCount: number;
}

export function isLimitReached({
    userPlan,
    resourceType,
    currentCount,
}: CheckLimitInput): boolean {
    const planData = STRIPE_PLANS[userPlan];

    // If no limits for plan (e.g. Pro or Enterprise), always allowed
    if (!planData?.limits) return false;

    const limits = planData.limits;

    const resourceLimitMap: Record<ResourceType, number | undefined> = {
        links: limits.links,
        menu_categories: limits.menuCategories,
        menu_items: limits.menuItemsPerCategory,
        events: limits.events,
        faq_categories: limits.faqCategories,
        faqs: limits.faqsPerCategory,
        qr_codes: limits.qr_codes,
    };

    const limit = resourceLimitMap[resourceType];

    if (limit === undefined) return false;

    return currentCount >= limit;
}

type StripePlanConfig = {
    name: string;
    description: string;
    price: number;
    priceId: string | null;
    features: string[];
    limits: Record<string, number> | null;
};

export type StripePlans = Record<StripePlan, StripePlanConfig>;

export function getStripePlans(locale: string): StripePlans {
    switch (locale) {
        // 🇩🇪 German
        case "de":
            return {
                basic: {
                    name: "Basis",
                    description: "Perfekt für kleine Restaurants, die gerade online starten",
                    price: 0,
                    priceId: null,
                    features: [
                        "4 Links",
                        "4 Menü-Kategorien",
                        "3 Gerichte pro Kategorie",
                        "3 Veranstaltungen",
                        "4 FAQ-Kategorien",
                        "2 FAQs pro Kategorie",
                        "Basis-Analysen",
                        "QR-Code-Generierung",
                    ],
                    limits: {
                        links: 4,
                        menuCategories: 2,
                        menuItemsPerCategory: 2,
                        events: 3,
                        faqCategories: 2,
                        faqsPerCategory: 2,
                        qr_codes: 0,
                    },
                },
                pro: {
                    name: "Profi",
                    description: "Am beliebtesten bei etablierten Restaurants",
                    price: 19,
                    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
                    features: [
                        "Unbegrenzte Links",
                        "Unbegrenzte Menü-Kategorien",
                        "Unbegrenzte Gerichte",
                        "Unbegrenzte Veranstaltungen",
                        "Unbegrenzte FAQ-Kategorien",
                        "Unbegrenzte FAQs",
                        "Erweiterte Analysen",
                        "Individuelles Branding",
                        "Priorisierter Support",
                        "Erweiterte QR-Codes",
                    ],
                    limits: null,
                },
                enterprise: {
                    name: "Unternehmen",
                    description: "Für Restaurantgruppen und Franchise-Betriebe",
                    price: 49,
                    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
                    features: [
                        "Alles aus Pro",
                        "White-Label-Lösung",
                        "API-Zugang",
                        "Individuelle Integrationen",
                        "Dedizierter Support",
                        "Erweiterte Sicherheit",
                        "Eigene Domain",
                        "Massenoperationen",
                    ],
                    limits: null,
                },
            };

        // 🇪🇸 Spanish
        case "es":
            return {
                basic: {
                    name: "Básico",
                    description: "Perfecto para restaurantes pequeños que recién comienzan en línea",
                    price: 0,
                    priceId: null,
                    features: [
                        "4 Enlaces",
                        "4 Categorías de Menú",
                        "3 Platos por Categoría",
                        "3 Eventos",
                        "4 Categorías de Preguntas Frecuentes",
                        "2 Preguntas Frecuentes por Categoría",
                        "Analíticas Básicas",
                        "Generación de Códigos QR",
                    ],
                    limits: {
                        links: 4,
                        menuCategories: 2,
                        menuItemsPerCategory: 2,
                        events: 3,
                        faqCategories: 2,
                        faqsPerCategory: 2,
                        qr_codes: 0,
                    },
                },
                pro: {
                    name: "Pro",
                    description: "El más popular para restaurantes consolidados",
                    price: 19,
                    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
                    features: [
                        "Enlaces Ilimitados",
                        "Categorías de Menú Ilimitadas",
                        "Platos Ilimitados",
                        "Eventos Ilimitados",
                        "Categorías de FAQ Ilimitadas",
                        "FAQs Ilimitados",
                        "Analíticas Avanzadas",
                        "Marca Personalizada",
                        "Soporte Prioritario",
                        "Códigos QR Avanzados",
                    ],
                    limits: null,
                },
                enterprise: {
                    name: "Empresarial",
                    description: "Para grupos de restaurantes y franquicias",
                    price: 49,
                    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
                    features: [
                        "Todo lo de Pro",
                        "Solución White Label",
                        "Acceso a API",
                        "Integraciones Personalizadas",
                        "Soporte Dedicado",
                        "Seguridad Avanzada",
                        "Dominio Personalizado",
                        "Operaciones en Masa",
                    ],
                    limits: null,
                },
            };

        // 🇫🇷 French
        case "fr":
            return {
                basic: {
                    name: "Basique",
                    description: "Parfait pour les petits restaurants qui débutent en ligne",
                    price: 0,
                    priceId: null,
                    features: [
                        "4 Liens",
                        "4 Catégories de Menu",
                        "3 Plats par Catégorie",
                        "3 Événements",
                        "4 Catégories de FAQ",
                        "2 FAQ par Catégorie",
                        "Analyses de Base",
                        "Génération de QR Code",
                    ],
                    limits: {
                        links: 4,
                        menuCategories: 2,
                        menuItemsPerCategory: 2,
                        events: 3,
                        faqCategories: 2,
                        faqsPerCategory: 2,
                        qr_codes: 0,
                    },
                },
                pro: {
                    name: "Pro",
                    description: "Le plus populaire pour les restaurants établis",
                    price: 19,
                    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
                    features: [
                        "Liens Illimités",
                        "Catégories de Menu Illimitées",
                        "Plats Illimités",
                        "Événements Illimités",
                        "Catégories de FAQ Illimitées",
                        "FAQs Illimitées",
                        "Analyses Avancées",
                        "Marque Personnalisée",
                        "Support Prioritaire",
                        "QR Codes Avancés",
                    ],
                    limits: null,
                },
                enterprise: {
                    name: "Entreprise",
                    description: "Pour les groupes et franchises de restaurants",
                    price: 49,
                    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
                    features: [
                        "Tout dans Pro",
                        "Solution White Label",
                        "Accès API",
                        "Intégrations Personnalisées",
                        "Support Dédié",
                        "Sécurité Avancée",
                        "Domaine Personnalisé",
                        "Opérations en Masse",
                    ],
                    limits: null,
                },
            };

        // 🇮🇹 Italian
        case "it":
            return {
                basic: {
                    name: "Base",
                    description: "Perfetto per i piccoli ristoranti che iniziano online",
                    price: 0,
                    priceId: null,
                    features: [
                        "4 Link",
                        "4 Categorie di Menu",
                        "3 Piatti per Categoria",
                        "3 Eventi",
                        "4 Categorie FAQ",
                        "2 FAQ per Categoria",
                        "Analisi di Base",
                        "Generazione QR Code",
                    ],
                    limits: {
                        links: 4,
                        menuCategories: 2,
                        menuItemsPerCategory: 2,
                        events: 3,
                        faqCategories: 2,
                        faqsPerCategory: 2,
                        qr_codes: 0,
                    },
                },
                pro: {
                    name: "Pro",
                    description: "Il più popolare per i ristoranti affermati",
                    price: 19,
                    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
                    features: [
                        "Link Illimitati",
                        "Categorie di Menu Illimitate",
                        "Piatti Illimitati",
                        "Eventi Illimitati",
                        "Categorie FAQ Illimitate",
                        "FAQ Illimitate",
                        "Analisi Avanzate",
                        "Branding Personalizzato",
                        "Supporto Prioritario",
                        "QR Code Avanzati",
                    ],
                    limits: null,
                },
                enterprise: {
                    name: "Impresa",
                    description: "Per gruppi e catene di ristoranti",
                    price: 49,
                    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
                    features: [
                        "Tutto in Pro",
                        "Soluzione White Label",
                        "Accesso API",
                        "Integrazioni Personalizzate",
                        "Supporto Dedicato",
                        "Sicurezza Avanzata",
                        "Dominio Personalizzato",
                        "Operazioni Bulk",
                    ],
                    limits: null,
                },
            };

        // 🇳🇱 Dutch
        case "nl":
            return {
                basic: {
                    name: "Basis",
                    description: "Perfect voor kleine restaurants die net online beginnen",
                    price: 0,
                    priceId: null,
                    features: [
                        "4 Links",
                        "4 Menu Categorieën",
                        "3 Gerechten per Categorie",
                        "3 Evenementen",
                        "4 FAQ Categorieën",
                        "2 FAQs per Categorie",
                        "Basisanalyse",
                        "QR-code Generatie",
                    ],
                    limits: {
                        links: 4,
                        menuCategories: 2,
                        menuItemsPerCategory: 2,
                        events: 3,
                        faqCategories: 2,
                        faqsPerCategory: 2,
                        qr_codes: 0,
                    },
                },
                pro: {
                    name: "Pro",
                    description: "Meest populair bij gevestigde restaurants",
                    price: 19,
                    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
                    features: [
                        "Onbeperkte Links",
                        "Onbeperkte Menu Categorieën",
                        "Onbeperkte Gerechten",
                        "Onbeperkte Evenementen",
                        "Onbeperkte FAQ Categorieën",
                        "Onbeperkte FAQs",
                        "Geavanceerde Analyse",
                        "Aangepaste Branding",
                        "Prioritaire Support",
                        "Geavanceerde QR-codes",
                    ],
                    limits: null,
                },
                enterprise: {
                    name: "Enterprise",
                    description: "Voor restaurantgroepen en franchises",
                    price: 49,
                    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
                    features: [
                        "Alles in Pro",
                        "White Label Oplossing",
                        "API Toegang",
                        "Aangepaste Integraties",
                        "Toegewijde Support",
                        "Geavanceerde Beveiliging",
                        "Aangepast Domein",
                        "Bulkbewerkingen",
                    ],
                    limits: null,
                },
            };

        // 🇬🇧 Default (English)
        default:
            return {
                basic: {
                    name: "Basic",
                    description: "Perfect for small restaurants just getting started online",
                    price: 0,
                    priceId: null,
                    features: [
                        "4 Links",
                        "4 Menu Categories",
                        "3 Menu Items per Category",
                        "3 Events",
                        "4 FAQ Categories",
                        "2 FAQs per Category",
                        "Basic Analytics",
                        "QR Code Generation",
                    ],
                    limits: {
                        links: 4,
                        menuCategories: 2,
                        menuItemsPerCategory: 2,
                        events: 3,
                        faqCategories: 2,
                        faqsPerCategory: 2,
                        qr_codes: 0,
                    },
                },
                pro: {
                    name: "Pro",
                    description: "Most popular for established restaurants",
                    price: 19,
                    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
                    features: [
                        "Unlimited Links",
                        "Unlimited Menu Categories",
                        "Unlimited Menu Items",
                        "Unlimited Events",
                        "Unlimited FAQ Categories",
                        "Unlimited FAQs",
                        "Advanced Analytics",
                        "Custom Branding",
                        "Priority Support",
                        "Advanced QR Codes",
                    ],
                    limits: null,
                },
                enterprise: {
                    name: "Enterprise",
                    description: "For restaurant groups and franchises",
                    price: 49,
                    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
                    features: [
                        "Everything in Pro",
                        "White Label Solution",
                        "API Access",
                        "Custom Integrations",
                        "Dedicated Support",
                        "Advanced Security",
                        "Custom Domain",
                        "Bulk Operations",
                    ],
                    limits: null,
                },
            };
    }
}
