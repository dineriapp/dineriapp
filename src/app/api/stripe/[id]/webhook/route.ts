import { decrypt_key } from "@/lib/crypto-encrypt-and-decrypt"
import prisma from "@/lib/prisma"
import { sendEmailUsingResend } from "@/lib/resend"
import { getValidStripeClient } from "@/lib/stripe"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurant_webhook_api")

    const { id: restaurantId } = await params

    if (!restaurantId) {
        return NextResponse.json({ error: t("errors.restaurant_id_missing") }, { status: 400 })
    }

    // Fetch the webhook secret from DB
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { stripe_webhook_secret_encrypted: true, stripe_secret_key_encrypted: true },
    })


    if (!restaurant || !restaurant.stripe_webhook_secret_encrypted || !restaurant.stripe_secret_key_encrypted) {
        return NextResponse.json({ error: t("errors.webhook_secret_not_found") }, { status: 400 })
    }


    const webhookSecret = decrypt_key(restaurant.stripe_webhook_secret_encrypted)
    const stripeSecretKey = decrypt_key(restaurant.stripe_secret_key_encrypted)

    const stripeClient = await getValidStripeClient(stripeSecretKey)

    if (!stripeClient) {
        return NextResponse.json({ error: t("errors.invalid_stripe_secret_key") }, { status: 400 })
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
        console.error("No Stripe signature found")
        return NextResponse.json({ error: t("errors.no_signature") }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        // event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret)

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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log("Processing checkout.session.completed")

    const orderId = session.metadata?.order_id;

    if (!orderId) {
        console.error("Missing order_id in metadata");
        return;
    }

    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
    });



    if (!existingOrder) {
        console.error("Order not found:", orderId);
        return;
    }

    // Idempotency protection (Stripe retries webhooks)
    if (existingOrder.payment_status === "completed") {
        console.log("Order already completed, skipping.");
        return;
    }

    await prisma.order.update({
        where: { id: orderId },
        data: {
            stripe_payment_intent: session.payment_intent as string,
            payment_status: "completed",
            status: "confirmed",
        },
    });

    const restaurent = await prisma.restaurant.findUnique({
        where: {
            id: existingOrder?.restaurant_id
        },
        select: {
            name: true,
            email_from_name: true,
            email_from_address: true,
            email_api_key_encrypted: true,
        }
    });

    if (
        restaurent &&
        restaurent.email_from_name &&
        restaurent.email_from_address &&
        restaurent.email_api_key_encrypted
    ) {
        // existingOrder has all fields required to send email
        const html = `
<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px;">
    
    <h2 style="color: #111827; margin-bottom: 10px;">
      Thank You for Your Order, ${existingOrder.customer_name || "Valued Customer"}!
    </h2>

    <p style="color: #374151; font-size: 15px;">
      We’re happy to let you know that your payment has been successfully received and your order has been confirmed.
    </p>

    <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 6px;">
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${existingOrder.order_number}</p>
      <p style="margin: 5px 0;"><strong>Order Type:</strong> ${existingOrder.order_type}</p>
      <p style="margin: 5px 0;"><strong>Total Amount:</strong> €${existingOrder.total_amount.toFixed(2)}</p>
      ${existingOrder.estimated_ready_time
                ? `<p style="margin: 5px 0;"><strong>Estimated Ready Time:</strong> ${new Date(
                    existingOrder.estimated_ready_time
                ).toLocaleString()}</p>`
                : ""
            }
    </div>

    <p style="color: #374151; font-size: 15px;">
      Our team is now preparing your order with care. ${existingOrder.order_type === "delivery"
                ? "It will be delivered to your selected address."
                : "It will be ready for pickup at the restaurant."
            }
    </p>

    <p style="color: #374151; font-size: 15px; margin-top: 20px;">
      If you have any questions, feel free to contact us.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

    <p style="font-size: 13px; color: #6b7280;">
      Thank you for choosing ${restaurent.name}. We truly appreciate your business!
    </p>

  </div>
</div>
`;
        const subject = `Your Order ${existingOrder.order_number} Has Been Confirmed`;        //    send email 
        await sendEmailUsingResend({
            type: "restaurant",
            apiKey: decrypt_key(restaurent.email_api_key_encrypted),
            to: existingOrder.customer_email || "",
            fromEmail: restaurent.email_from_address,
            fromName: restaurent.email_from_name,
            html: html,
            subject: subject,
        });
    }

    console.log(`Order ${orderId} confirmed`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log("Processing payment_intent.succeeded")

    const order = await prisma.order.findFirst({
        where: { stripe_payment_intent: paymentIntent.id },
    });

    if (!order) return;

    if (order.payment_status === "completed") return;

    await prisma.order.update({
        where: { id: order.id },
        data: {
            payment_status: "completed",
            status: "confirmed",
        },
    });

    console.log(`Order ${order.id} marked completed`);
}


async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log("Processing payment_intent.payment_failed")

    const order = await prisma.order.findFirst({
        where: { stripe_payment_intent: paymentIntent.id },
    });

    if (!order) return;

    if (order.payment_status === "failed") return;

    await prisma.order.update({
        where: { id: order.id },
        data: {
            payment_status: "failed",
            status: "cancelled",
        },
    });

    console.log(`Order ${order.id} marked failed`);
}
