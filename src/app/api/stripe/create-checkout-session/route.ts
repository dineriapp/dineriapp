import prisma from "@/lib/prisma"
import { stripe, } from "@/lib/stripe"
import { STRIPE_PLANS, isValidPlan } from "@/lib/stripe-plans"
import { createClient } from "@/supabase/clients/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createCheckoutSchema = z.object({
    plan: z.string().refine(isValidPlan, "Invalid plan"),
})

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const { plan } = createCheckoutSchema.parse(body)

        // Authenticate user
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        // Get user from database
        const dbUser = await prisma.user.findFirst({
            where: { supabase_id: user.id },
        })

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Check if user already has an active subscription
        const hasActiveSubscription =
            dbUser.subscription_status === "active" &&
            dbUser.stripe_subscription_id &&
            (!dbUser.subscription_current_period_end || new Date() < new Date(dbUser.subscription_current_period_end))

        if (hasActiveSubscription) {
            const currentPlan = dbUser.subscription_plan || "basic"

            // If user is trying to subscribe to the same plan they already have
            if (currentPlan === plan) {
                return NextResponse.json(
                    {
                        error: `You already have an active ${plan} subscription. You can manage your subscription from the settings page.`,
                    },
                    { status: 400 },
                )
            }

            // If user is trying to subscribe to a different plan
            return NextResponse.json(
                {
                    error: `You already have an active ${currentPlan} subscription. To switch to ${plan}, please cancel your current subscription first from the settings page, then subscribe to the new plan.`,
                },
                { status: 400 },
            )
        }

        // Check if plan exists and has a price ID
        const planData = STRIPE_PLANS[plan]
        if (!planData.priceId) {
            return NextResponse.json({ error: "Invalid plan for checkout" }, { status: 400 })
        }

        // Create or retrieve Stripe customer
        let customerId = dbUser.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    user_id: dbUser.id,
                },
            })
            customerId = customer.id

            // Update user with customer ID
            await prisma.user.update({
                where: { id: dbUser.id },
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
                user_id: dbUser.id,
                plan: plan,
            },
            subscription_data: {
                metadata: {
                    user_id: dbUser.id,
                    plan: plan,
                },
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("Checkout session creation error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
        }

        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
    }
}
