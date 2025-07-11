import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { authenticateAndAuthorize } from "@/lib/auth-utils"

const updateIntegrationsSchema = z.object({
    google_place_id: z.string().optional().nullable(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate request body
        const validatedData = updateIntegrationsSchema.parse(body)

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user } = authResult.data!

        // Check if user has Pro/Enterprise subscription for Google Place ID integration
        if (validatedData.google_place_id) {
            const isSubscriptionActive =
                user.subscription_status === "active" &&
                user.subscription_plan !== "basic" &&
                (!user.subscription_current_period_end || new Date() < new Date(user.subscription_current_period_end))

            if (!isSubscriptionActive) {
                return NextResponse.json(
                    {
                        error:
                            "Google Places integration is only available for Pro and Enterprise plans. Upgrade your subscription to access this feature.",
                        upgrade_required: true,
                    },
                    { status: 403 },
                )
            }

            // If a Google Place ID is provided, validate it
            const apiKey = process.env.GOOGLE_PLACES_API_KEY
            if (apiKey) {
                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${validatedData.google_place_id}&fields=place_id,name&key=${apiKey}`,
                    )
                    const data = await response.json()

                    if (data.status !== "OK") {
                        return NextResponse.json({ error: "Invalid Google Place ID" }, { status: 400 })
                    }
                } catch (error) {
                    console.error("Error validating Place ID:", error)
                    return NextResponse.json({ error: "Failed to validate Google Place ID" }, { status: 400 })
                }
            }
        }

        // Update restaurant with optimized query (only update necessary fields)
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: id },
            data: {
                google_place_id: validatedData.google_place_id || null,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                google_place_id: true,
                updatedAt: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
            message: "Integration settings updated successfully",
        })
    } catch (error) {
        console.error("Error updating integration settings:", error)

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
