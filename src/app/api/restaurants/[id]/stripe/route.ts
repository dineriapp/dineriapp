import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { encrypt_key } from "@/lib/crypto-encrypt-and-decrypt"
import { getValidStripeClient } from "@/lib/stripe"
import { authenticateAndAuthorize } from "@/lib/auth-utils"

const updateStripeSchema = z.object({
    stripe_public_key: z
        .string()
        .min(1, "Public key is required")
        .startsWith("pk_", "Invalid public key format"),
    stripe_secret_key: z
        .string()
        .min(1, "Secret key is required")
        .startsWith("sk_", "Invalid secret key format"),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
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
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // Prepare update data with encryption
        const updateData: any = {}

        const stripeClient = await getValidStripeClient(validatedData.stripe_secret_key)

        if (!stripeClient) {
            return NextResponse.json({ error: "Invalid Stripe secret key" }, { status: 400 })
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
            console.log(webhook)
            if (webhook?.secret) {
                updateData.stripe_webhook_secret_encrypted = encrypt_key(webhook.secret)
            } else {
                return NextResponse.json({ error: "Invalid Stripe secret key or webhook error" }, { status: 400 })
            }
        } catch (err: any) {
            console.error(err)
            // Silently ignore if webhook already exists
            if (err?.raw?.type !== "invalid_request_error") {
                console.error("Failed to register webhook:", err)
                return NextResponse.json({ error: "Invalid Stripe secret key or webhook error" }, { status: 400 })
            }
            return NextResponse.json({ error: "Invalid Stripe secret key or webhook setup error" }, { status: 400 })
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
            message: "Stripe settings updated successfully",
        })
    } catch (error) {
        console.error("Error updating Stripe settings:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors,
                },
                { status: 400 },
            )
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
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
            message: "Stripe keys removed successfully",
        })
    } catch (error) {
        console.error("Error removing Stripe keys:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
