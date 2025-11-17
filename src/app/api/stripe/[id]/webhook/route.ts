import { decrypt_key } from "@/lib/crypto-encrypt-and-decrypt"
import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurant_webhook_api")

    const { id: restaurantId } = await params

    if (!restaurantId) {
        return NextResponse.json({ error: t("errors.restaurant_id_missing") }, { status: 400 })
    }

    // Fetch the webhook secret from DB
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { stripe_webhook_secret_encrypted: true },
    })

    if (!restaurant || !restaurant.stripe_webhook_secret_encrypted) {
        return NextResponse.json({ error: t("errors.webhook_secret_not_found") }, { status: 400 })
    }

    const webhookSecret = decrypt_key(restaurant.stripe_webhook_secret_encrypted)


    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
        console.error("No Stripe signature found")
        return NextResponse.json({ error: t("errors.no_signature") }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        // event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
        console.error("Webhook signature verification failed:", error)
        return NextResponse.json({ error: t("errors.invalid_signature") }, { status: 400 })
    }

    // Check if this is a payment-related event by looking at metadata
    const isPaymentEvent = (metadata: any) => {
        return metadata?.type === "payment" || metadata?.restaurant_id || metadata?.order_number
    }

    // Check if this is a reservation deposit event
    const isReservationDepositEvent = (metadata: any) => {
        return metadata?.type === "reservation_deposit" && metadata?.reservation_id
    }

    // Early return if this is not a payment event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        // Check if it's a reservation deposit event first
        if (isReservationDepositEvent(session.metadata)) {
            console.log("Processing reservation deposit webhook event")
            try {
                await handleReservationDepositCompleted(session)
                return NextResponse.json({ received: true, message: "Reservation deposit processed" })
            } catch (error) {
                console.error("Error processing reservation deposit:", error)
                return NextResponse.json({ error: "Failed to process reservation deposit" }, { status: 500 })
            }
        }

        // Existing logic for payment events
        if (!isPaymentEvent(session.metadata)) {
            return NextResponse.json({ received: true, message: t("info.not_a_payment_event") })
        }
    }

    // For other payment-related events, check metadata
    if (event.data.object && "metadata" in event.data.object) {
        const metadata = (event.data.object as any).metadata;

        // Check if it's a reservation deposit event first
        if (isReservationDepositEvent(metadata)) {
            console.log("Processing reservation deposit webhook event")
            try {
                switch (event.type) {
                    case "payment_intent.succeeded":
                        await handleReservationPaymentSucceeded(event.data.object as Stripe.PaymentIntent)
                        break
                    case "payment_intent.payment_failed":
                        await handleReservationPaymentFailed(event.data.object as Stripe.PaymentIntent)
                        break
                    default:
                        console.log(`Unhandled reservation event type: ${event.type}`)
                }
                return NextResponse.json({ received: true, message: "Reservation event processed" })
            } catch (error) {
                console.error("Error processing reservation event:", error)
                return NextResponse.json({ error: "Failed to process reservation event" }, { status: 500 })
            }
        }

        // Existing logic for payment events
        if (!isPaymentEvent(metadata)) {
            return NextResponse.json({ received: true, message: t("info.not_a_payment_event") })
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
        return NextResponse.json({ error: t("errors.webhook_handler_failed") }, { status: 500 })
    }
}

//  Reservation deposit webhook handlers
// NEW: Reservation deposit webhook handlers
async function handleReservationDepositCompleted(session: Stripe.Checkout.Session) {
    console.log("Processing reservation deposit checkout.session.completed")

    if (!session.metadata) {
        console.error("Missing metadata in reservation deposit session")
        return
    }

    const reservationId = session.metadata.reservation_id;

    if (!reservationId) {
        console.error("Missing reservation_id in metadata");
        return;
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Update reservation status to CONFIRMED
            await tx.reservation.update({
                where: { id: reservationId },
                data: { status: 'CONFIRMED' }
            });

            // Update payment status to PAID and add Stripe details
            await tx.payment.updateMany({
                where: { reservation_id: reservationId },
                data: {
                    status: 'PAID', // Make sure this matches your ReservationPaymentStatus enum
                    paid_at: new Date(),
                    stripe_payment_intent_id: session.payment_intent as string,
                    stripe_session_id: session.id,
                    transaction_id: session.payment_intent as string,
                    payment_method: 'card'
                }
            });
        });

        console.log(`Reservation ${reservationId} confirmed and payment marked as paid`);
    } catch (error) {
        console.error("Error processing reservation deposit:", error);
        throw error;
    }
}

async function handleReservationPaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log("Processing reservation payment_intent.succeeded")

    try {
        await prisma.$transaction(async (tx) => {
            // Find the payment with this payment intent ID
            const payment = await tx.payment.findFirst({
                where: {
                    stripe_payment_intent_id: paymentIntent.id
                },
                include: {
                    reservation: true
                }
            });

            if (payment) {
                // Only update if not already confirmed
                if (payment.reservation.status !== 'CONFIRMED') {
                    await tx.reservation.update({
                        where: { id: payment.reservation_id },
                        data: { status: 'CONFIRMED' }
                    });
                }

                // Only update payment if not already paid
                if (payment.status !== 'PAID') {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'PAID', // Make sure this matches your ReservationPaymentStatus enum
                            paid_at: new Date(),
                        }
                    });
                }
            }
        });

        console.log(`Updated reservation payment status for payment intent ${paymentIntent.id}`);
    } catch (error) {
        console.error("Error updating reservation payment status:", error);
        throw error;
    }
}

async function handleReservationPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log("Processing reservation payment_intent.payment_failed")

    try {
        await prisma.$transaction(async (tx) => {
            // Find the payment with this payment intent ID
            const payment = await tx.payment.findFirst({
                where: {
                    stripe_payment_intent_id: paymentIntent.id
                },
                include: {
                    reservation: true
                }
            });

            if (payment && payment.reservation) {
                // Delete table reservations to free up tables
                await tx.tableReservation.deleteMany({
                    where: { reservation_id: payment.reservation.id }
                });

                // Delete payment record
                await tx.payment.delete({
                    where: { id: payment.id }
                });

                // Delete the reservation
                await tx.reservation.delete({
                    where: { id: payment.reservation.id }
                });
            }
        });

        console.log(`Cancelled reservation for failed payment intent ${paymentIntent.id}`);
    } catch (error) {
        console.error("Error handling failed reservation payment:", error);
        throw error;
    }
}

// EXISTING LOGIC - DON'T TOUCH
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