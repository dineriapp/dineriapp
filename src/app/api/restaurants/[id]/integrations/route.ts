import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params
        const body = await request.json()

        // Validate request body
        if (body.google_place_id && typeof body.google_place_id !== "string") {
            return NextResponse.json({ error: t("errors.validation_failed") }, { status: 400 })
        }

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user } = authResult.data!

        // Check if user has Pro/Enterprise subscription for Google Place ID integration
        if (body.google_place_id) {
            const isSubscriptionActive =
                user.subscription_status === "active" &&
                user.subscription_plan !== "basic" &&
                (!user.subscription_current_period_end || new Date() < new Date(user.subscription_current_period_end))

            if (!isSubscriptionActive) {
                return NextResponse.json(
                    {
                        error:
                            t("errors.upgrade_required_google_places"),
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
                        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${body.google_place_id}&fields=place_id,name&key=${apiKey}`,
                    )
                    const data = await response.json()

                    if (data.status !== "OK") {
                        return NextResponse.json({ error: t("errors.invalid_google_place_id") }, { status: 400 })
                    }
                } catch (error) {
                    console.error("Error validating Place ID:", error)
                    return NextResponse.json({ error: t("errors.failed_validate_google_place_id") }, { status: 400 })
                }
            }
        }

        // Update restaurant with optimized query (only update necessary fields)
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: id },
            data: {
                google_place_id: body.google_place_id || null,
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
            message: t("success.integration_update_success"),
        })
    } catch (error) {
        console.error("Error updating integration settings:", error)

        return NextResponse.json({ error: t("errors.internal_server_error") }, { status: 500 })
    }
}
