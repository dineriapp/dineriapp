import { decrypt_key } from "@/lib/crypto-encrypt-and-decrypt"
import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: restaurantId } = await params

    if (!restaurantId) {
        return NextResponse.json({ error: "Restaurant ID missing in URL" }, { status: 400 })
    }

    // Fetch the webhook secret from DB
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { stripe_webhook_secret_encrypted: true },
    })

    if (!restaurant || !restaurant.stripe_webhook_secret_encrypted) {
        return NextResponse.json({ error: "Webhook secret not found for restaurant" }, { status: 400 })
    }

    const webhookSecret = decrypt_key(restaurant.stripe_webhook_secret_encrypted)


    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
        console.error("No Stripe signature found")
        return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
        console.error("Webhook signature verification failed:", error)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Check if this is a payment-related event by looking at metadata
    const isPaymentEvent = (metadata: any) => {
        return metadata?.type === "payment" || metadata?.restaurant_id || metadata?.order_number
    }

    // Early return if this is not a payment event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        if (!isPaymentEvent(session.metadata)) {
            return NextResponse.json({ received: true, message: "Not a payment event" })
        }
    }

    // For other payment-related events, check metadata
    if (event.data.object && "metadata" in event.data.object) {
        if (!isPaymentEvent((event.data.object as any).metadata)) {
            return NextResponse.json({ received: true, message: "Not a payment event" })
        }
    }

    console.log(`Received webhook event: ${event.type}`)

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
                break

            case "payment_intent.succeeded":
                await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
                break

            case "payment_intent.payment_failed":
                await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error(`Webhook handler error for ${event.type}:`, error)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log("Processing checkout.session.completed")

    if (!session.metadata) {
        console.error("Missing metadata in checkout session")
        return
    }

    const {
        user_id,
        restaurant_id,
        order_number,
        order_type,
        preferredISO,
        subtotal,
        tax_amount,
        delivery_fee,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        street,
        city,
        state,
        postal_code,
        country,
        latitude,
        longitude,
        delivery_notes,
        special_instructions,
        is_guest,
        items,
    } = session.metadata

    try {
        // Parse items from metadata
        const orderItems = JSON.parse(items)
        const isGuestOrder = is_guest === "true" || user_id === "guest"

        // Create order in database
        const orderData: any = {
            restaurant_id,
            stripe_payment_intent: session.payment_intent as string,
            stripe_session_id: session.id,
            order_number,
            customer_name: customer_name || null,
            customer_email: customer_email || null,
            customer_phone: customer_phone || null,
            // Address fields
            delivery_address: delivery_address || null,
            street: street || null,
            city: city || null,
            state: state || null,
            postal_code: postal_code || null,
            country: country || null,
            latitude: latitude ? Number.parseFloat(latitude) : null,
            longitude: longitude ? Number.parseFloat(longitude) : null,
            notes: delivery_notes || null,
            order_type,
            preferredISO: preferredISO || "",
            status: "confirmed",
            payment_status: "completed",
            subtotal: Number.parseFloat(subtotal),
            tax_amount: Number.parseFloat(tax_amount),
            delivery_fee: Number.parseFloat(delivery_fee),
            total_amount: Number.parseFloat(total_amount),
            special_instructions: special_instructions || null,
            estimated_ready_time: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
            items: {
                create: orderItems.map((item: any) => ({
                    menu_item_id: item.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    quantity: item.quantity,
                    item_total: item.price * item.quantity,
                    allergens: item.allergens || [],
                    addons: item.addons
                })),
            },
        }
        console.log(orderData)
        // Only add user_id if it's not a guest order
        if (!isGuestOrder && user_id && user_id !== "guest") {
            orderData.user_id = user_id
        }

        const order = await prisma.order.create({
            data: orderData,
            include: {
                items: true,
            },
        })

        console.log(order)

        console.log(`Created ${isGuestOrder ? "guest " : ""}order ${order.order_number}`)
    } catch (error) {
        console.error("Error creating order:", error)
        throw error
    }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log("Processing payment_intent.succeeded")

    try {
        await prisma.order.updateMany({
            where: { stripe_payment_intent: paymentIntent.id },
            data: {
                payment_status: "completed",
                status: "confirmed",
            },
        })

        console.log(`Updated payment status for payment intent ${paymentIntent.id}`)
    } catch (error) {
        console.error("Error updating payment status:", error)
        throw error
    }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log("Processing payment_intent.payment_failed")

    try {
        await prisma.order.updateMany({
            where: { stripe_payment_intent: paymentIntent.id },
            data: {
                payment_status: "failed",
                status: "cancelled",
            },
        })

        console.log(`Updated failed payment status for payment intent ${paymentIntent.id}`)
    } catch (error) {
        console.error("Error updating failed payment status:", error)
        throw error
    }
}
