// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import type Stripe from "stripe"
import { isValidPlan } from "@/lib/stripe-plans"
import { stripe } from "@/lib/stripe"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"

interface WebhookMetadata {
    user_id?: string
    plan?: string
}

export async function POST(request: NextRequest) {

    const t = await getTranslations("stripe_webhook_api")
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
        console.error("No Stripe signature found")
        return NextResponse.json({ error: t("errors.no_signature_provided") }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("STRIPE_WEBHOOK_SECRET not configured")
        return NextResponse.json({ error: t("errors.webhook_secret_not_configured") }, { status: 500 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        console.error("Webhook signature verification failed:", error)
        return NextResponse.json({ error: t("errors.invalid_signature") }, { status: 400 })
    }



    console.log(`Processing webhook event: ${event.type}`)

    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object)
                break

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object)
                break

            case "invoice.payment_succeeded":
                await handlePaymentSucceeded(event.data.object)
                break

            case "invoice.payment_failed":
                await handlePaymentFailed(event.data.object)
                break
            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error(`Webhook handler error for ${event.type}:`, error)
        return NextResponse.json({ error: t("errors.webhook_handler_failed") }, { status: 500 })
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log("Processing checkout.session.completed")

    const metadata = session.metadata as WebhookMetadata
    const userId = metadata?.user_id
    const plan = metadata?.plan

    if (!userId || !plan || !isValidPlan(plan)) {
        console.error("Invalid metadata in checkout session:", metadata)
        return
    }

    if (!session.subscription) {
        console.error("No subscription ID in checkout session")
        return
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscription_plan: plan,
                subscription_status: "active",
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                subscription_current_period_start: new Date(),
                subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
        })

        console.log(`Subscription activated for user ${userId} with plan ${plan}`)
    } catch (error) {
        console.error("Failed to update user subscription:", error)
        throw error
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log("Processing customer.subscription.updated")

    if (!subscription.id) {
        console.error("No subscription ID provided")
        return
    }

    try {
        const user = await prisma.user.findFirst({
            where: { stripe_subscription_id: subscription.id },
        })

        if (!user) {
            console.error(`User not found for subscription ${subscription.id}`)
            return
        }

        const status = mapStripeStatus(subscription.status)

        const dataToUpdate: any = {
            subscription_status: status,
        }

        if (status === "inactive") {
            dataToUpdate.subscription_plan = "basic"
        }

        await prisma.user.update({
            where: { id: user.id },
            data: dataToUpdate,
        })

        console.log(`Subscription updated for user ${user.id}, status: ${status}`)
    } catch (error) {
        console.error("Failed to update subscription:", error)
        throw error
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    console.log("Processing customer.subscription.deleted")

    if (!subscription.id) {
        console.error("No subscription ID provided")
        return
    }

    try {
        const user = await prisma.user.findFirst({
            where: { stripe_subscription_id: subscription.id },
        })

        if (!user) {
            console.error(`User not found for subscription ${subscription.id}`)
            return
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscription_plan: "basic",
                subscription_status: "inactive",
                stripe_subscription_id: null,
                subscription_current_period_start: null,
                subscription_current_period_end: null,
            },
        })

        console.log(`Subscription canceled for user ${user.id}`)
    } catch (error) {
        console.error("Failed to cancel subscription:", error)
        throw error
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log("Processing invoice.payment_succeeded")

    if (!invoice.subscription) {
        console.log("Invoice not related to subscription, skipping")
        return
    }

    try {
        const user = await prisma.user.findFirst({
            where: { stripe_subscription_id: invoice.subscription as string },
        })

        if (!user) {
            console.error(`User not found for subscription ${invoice.subscription}`)
            return
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscription_status: "active",
            },
        })

        console.log(`Payment succeeded for user ${user.id}`)
    } catch (error) {
        console.error("Failed to process payment success:", error)
        throw error
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log("Processing invoice.payment_failed")

    if (!invoice.subscription) {
        console.log("Invoice not related to subscription, skipping")
        return
    }

    try {
        const user = await prisma.user.findFirst({
            where: { stripe_subscription_id: invoice.subscription as string },
        })

        if (!user) {
            console.error(`User not found for subscription ${invoice.subscription}`)
            return
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscription_status: "past_due",
            },
        })

        console.log(`Payment failed for user ${user.id}`)
    } catch (error) {
        console.error("Failed to process payment failure:", error)
        throw error
    }
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): "active" | "inactive" | "past_due" {
    switch (stripeStatus) {
        case "active":
            return "active"
        case "past_due":
            return "past_due"
        case "canceled":
        case "incomplete":
        case "incomplete_expired":
        case "unpaid":
        default:
            return "inactive"
    }
}