import { checkAuth } from "@/lib/auth/utils"
import prisma from "@/lib/prisma"
import { stripe, } from "@/lib/stripe"
import { getStripePlans, isValidPlan } from "@/lib/stripe-plans"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createCheckoutSchema = z.object({
    plan: z.string().refine(isValidPlan, "Invalid plan"),
})

export async function POST(request: NextRequest) {
    const t = await getTranslations("checkout_api.errors")
    try {
        // Parse and validate request body
        const body = await request.json()
        const { plan } = createCheckoutSchema.parse(body)

        // Authenticate user
        const user_session = await checkAuth()

        if (!user_session) {
            return NextResponse.json({ error: t("authentication_required") }, { status: 401 })
        }

        if (!user_session.user) {
            return NextResponse.json({ error: t("user_not_found") }, { status: 404 })
        }

        // Check if user already has an active subscription
        const hasActiveSubscription =
            user_session.user.subscription_status === "active" &&
            user_session.user.stripe_subscription_id &&
            (!user_session.user.subscription_current_period_end || new Date() < new Date(user_session.user.subscription_current_period_end))

        if (hasActiveSubscription) {
            const currentPlan = user_session.user.subscription_plan || "basic"

            // If user is trying to subscribe to the same plan they already have
            if (currentPlan === plan) {
                return NextResponse.json(
                    {
                        error: t("already_active_same_plan", { plan: plan }),
                    },
                    { status: 400 },
                )
            }

            // If user is trying to subscribe to a different plan
            return NextResponse.json(
                {
                    error: t("already_active_different_plan", { plan: plan, currentPlan: currentPlan }),
                },
                { status: 400 },
            )
        }

        // Check if plan exists and has a price ID
        const planData = getStripePlans("en")[plan]
        if (!planData.priceId) {
            return NextResponse.json({ error: t("invalid_plan_for_checkout") }, { status: 400 })
        }

        // Create or retrieve Stripe customer
        let customerId = user_session.user.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user_session.user.email,
                metadata: {
                    user_id: user_session.user.id,
                },
            })
            customerId = customer.id

            // Update user with customer ID
            await prisma.user.update({
                where: { id: user_session.user.id },
                data: { stripe_customer_id: customerId },
            })
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: planData.priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
            metadata: {
                user_id: user_session.user.id,
                plan: plan,
            },
            subscription_data: {
                metadata: {
                    type: "subscription",
                    user_id: user_session.user.id,
                    plan: plan,
                },
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("Checkout session creation error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: t("invalid_request_data") }, { status: 400 })
        }

        return NextResponse.json({ error: t("failed_create_checkout_session") }, { status: 500 })
    }
}
