import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { getTranslations } from "next-intl/server"

const dayHoursSchema = z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
})

const openingHoursSchema = z.object({
    timezone: z.string(),
    opening_hours: z.object({
        monday: dayHoursSchema,
        tuesday: dayHoursSchema,
        wednesday: dayHoursSchema,
        thursday: dayHoursSchema,
        friday: dayHoursSchema,
        saturday: dayHoursSchema,
        sunday: dayHoursSchema,
    }),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params
        const body = await request.json()

        // Validate request body
        const validatedData = openingHoursSchema.parse(body)

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        })

        if (!existingRestaurant) {
            return NextResponse.json(
                {
                    error: t("errors.restaurant_not_found")
                },
                {
                    status: 404
                })
        }

        // Validate opening hours logic
        const openingHours = validatedData.opening_hours
        const invalidDays: string[] = []

        Object.entries(openingHours).forEach(([day, hours]) => {
            if (!hours.closed) {
                // Check if both open and close times are provided
                if (!hours.open || !hours.close) {
                    invalidDays.push(day)
                    return
                }

                // Check if close time is after open time
                const openTime = new Date(`2000-01-01 ${hours.open}`)
                const closeTime = new Date(`2000-01-01 ${hours.close}`)

                if (closeTime <= openTime) {
                    invalidDays.push(`${day} (${t("errors.invalid_days")})`)
                }
            }
        })

        if (invalidDays.length > 0) {
            return NextResponse.json(
                {
                    error: t("errors.invalid_opening_hours"),
                    details: `Invalid hours for: ${invalidDays.join(", ")}`,
                },
                {
                    status: 400
                },
            )
        }

        // Update restaurant opening hours
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                opening_hours: validatedData.opening_hours,
                timezone: validatedData.timezone
            },
        })

        return NextResponse.json(
            {
                success: true,
                data: updatedRestaurant,
                message: t("success.opening_hours_update_success"),
            }
        )
    } catch (error) {
        console.error(
            "Error updating opening hours:",
            error
        )

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: t("errors.validation_failed"),
                    details: error.errors,
                },
                { status: 400 },
            )
        }

        return NextResponse.json(
            {
                error: t("errors.internal_server_error")
            },
            {
                status: 500
            }
        )
    }
}
