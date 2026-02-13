import { authenticateAndAuthorize } from "@/lib/auth-utils"
import { encrypt_key } from "@/lib/crypto-encrypt-and-decrypt"
import prisma from "@/lib/prisma"
import { getValidStripeClient } from "@/lib/stripe"
import { updateStripeSchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"



export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params

        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            select: {
                id: true,
                stripe_public_key_encrypted: true,
                stripe_secret_key_encrypted: true,
                stripe_webhook_secret_encrypted: true
            },
        })

        if (!restaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 })
        }

        // Return status only, never the actual keys
        return NextResponse.json({
            success: true,
            data: {
                has_public_key: !!restaurant.stripe_public_key_encrypted,
                has_secret_key: !!restaurant.stripe_secret_key_encrypted,
                has_webhook_setup: !!restaurant.stripe_webhook_secret_encrypted,
            },
        })
    } catch (error) {
        console.error("Error fetching Stripe settings:", error)
        return NextResponse.json({ error: t("errors.internal_server_error") }, { status: 500 })
    }
}



export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params


        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const body = await request.json()

        // Validate request body
        const validatedData = updateStripeSchema.parse(body)

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 })
        }

        // Prepare update data with encryption
        const updateData: any = {}

        const stripeClient = await getValidStripeClient(validatedData.stripe_secret_key)

        if (!stripeClient) {
            return NextResponse.json({ error: t("errors.invalid_stripe_secret_key") }, { status: 400 })
        }

        if (validatedData.stripe_public_key) {
            updateData.stripe_public_key_encrypted = encrypt_key(validatedData.stripe_public_key)
        }

        if (validatedData.stripe_secret_key) {
            updateData.stripe_secret_key_encrypted = encrypt_key(validatedData.stripe_secret_key)
        }

        // Register webhook for the restaurant
        // const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/${id}/webhook`
        const webhookUrl = `https://dineri.vercel.app/api/stripe/${id}/webhook`

        try {
            const webhook = await stripeClient.webhookEndpoints.create({
                url: webhookUrl,
                enabled_events: [
                    "checkout.session.completed",
                    "payment_intent.succeeded",
                    "payment_intent.payment_failed",
                ],
                description: `Restaurant ${id} Webhook`,
            })
            if (webhook?.secret) {
                updateData.stripe_webhook_secret_encrypted = encrypt_key(webhook.secret)
            } else {
                return NextResponse.json({ error: t("errors.invalid_stripe_secret_or_webhook_error") }, { status: 400 })
            }
        } catch (err: any) {
            console.error("Failed to register webhook:", err)
            // Silently ignore if webhook already exists
            if (err?.raw?.type !== "invalid_request_error") {
                return NextResponse.json({ error: t("errors.invalid_stripe_secret_or_webhook_error") }, { status: 400 })
            }
            return NextResponse.json({ error: t("errors.invalid_stripe_secret_or_webhook_error") }, { status: 400 })
        }

        // Update restaurant
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                stripe_public_key_encrypted: true,
                stripe_secret_key_encrypted: true,
                stripe_webhook_secret_encrypted: true
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                has_public_key: !!updatedRestaurant.stripe_public_key_encrypted,
                has_secret_key: !!updatedRestaurant.stripe_secret_key_encrypted,
                has_webhook_setup: !!updatedRestaurant.stripe_webhook_secret_encrypted,
            },
            message: t("success.stripe_update_success"),
        })
    } catch (error) {
        console.error("Error updating Stripe settings:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: t("errors.validation_failed"),
                    details: error.errors,
                },
                { status: 400 },
            )
        }

        return NextResponse.json({ error: t("errors.internal_server_error") }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 })
        }

        // Remove Stripe keys
        await prisma.restaurant.update({
            where: { id },
            data: {
                stripe_public_key_encrypted: null,
                stripe_secret_key_encrypted: null,
                stripe_webhook_secret_encrypted: null
            },
        })

        return NextResponse.json({
            success: true,
            message: t("success.stripe_keys_remove_success"),
        })
    } catch (error) {
        console.error("Error removing Stripe keys:", error)
        return NextResponse.json({ error: t("errors.internal_server_error") }, { status: 500 })
    }
}
