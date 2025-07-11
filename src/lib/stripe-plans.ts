
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