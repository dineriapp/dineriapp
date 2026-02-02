import { StripePlan } from "@better-auth/stripe"

export const STRIPE_PLANS = [
    {
        name: "pro",
        priceId: process.env.STRIPE_PRO_PRICE_ID!,
        limits: {
            create_organization: true,
        },
    },
    {
        name: "enterprise",
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
        limits: {
            create_organization: true,
        },
    },
] as const satisfies StripePlan[]

export const PLAN_TO_PRICE: Record<string, number> = {
    pro: 19,
    enterprise: 50,
}