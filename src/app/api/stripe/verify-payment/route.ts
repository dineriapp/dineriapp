import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt_key } from '@/lib/crypto-encrypt-and-decrypt';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    try {
        const { session_id, reservation_id } = await request.json();

        if (!session_id || !reservation_id) {
            return NextResponse.json(
                { error: 'Session ID and Reservation ID are required' },
                { status: 400 }
            );
        }

        // Get reservation with payment details
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservation_id },
            include: {
                payment: true,
            },
        });

        if (!reservation) {
            return NextResponse.json(
                { error: 'Reservation not found' },
                { status: 404 }
            );
        }

        // Get restaurant Stripe keys
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: reservation.restaurant_id },
            select: { stripe_secret_key_encrypted: true },
        });

        if (!restaurant?.stripe_secret_key_encrypted) {
            return NextResponse.json(
                { error: 'Stripe not configured for this restaurant' },
                { status: 400 }
            );
        }

        const stripeSecretKey = decrypt_key(restaurant.stripe_secret_key_encrypted);
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2025-07-30.basil",
        });

        // Verify the Stripe session
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['payment_intent'],
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 400 }
            );
        }

        // Check if payment was successful
        if (session.payment_status === 'paid') {
            // Get the payment intent ID as a string
            const paymentIntentId = typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id;

            if (!paymentIntentId) {
                return NextResponse.json(
                    { error: 'No payment intent found' },
                    { status: 400 }
                );
            }

            // Update reservation and payment status if not already updated by webhook
            // In the transaction, return only what you need
            const result = await prisma.$transaction(async (tx) => {
                // Update reservation if not confirmed
                if (reservation.status !== 'CONFIRMED') {
                    await tx.reservation.update({
                        where: { id: reservation_id },
                        data: { status: 'CONFIRMED' },
                    });
                }

                // Update payment if not paid
                let updatedPayment = null;
                if (reservation.payment && reservation.payment.status !== 'PAID') {
                    updatedPayment = await tx.payment.update({
                        where: { id: reservation.payment.id },
                        data: {
                            status: 'PAID',
                            paid_at: new Date(),
                            stripe_payment_intent_id: paymentIntentId,
                            stripe_session_id: session_id,
                            transaction_id: paymentIntentId,
                            payment_method: 'card',
                        },
                    });
                }

                // Get the updated reservation with payment
                const updatedReservation = await tx.reservation.findUnique({
                    where: { id: reservation_id },
                    include: {
                        payment: true,
                    },
                });

                return {
                    reservation: updatedReservation,
                    payment: updatedPayment || reservation.payment
                };
            });

            return NextResponse.json({
                success: true,
                reservation: result.reservation,
                payment: result.payment,
                message: 'Payment verified and reservation confirmed',
            });
        } else {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}