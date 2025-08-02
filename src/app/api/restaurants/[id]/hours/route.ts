import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

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
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
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
                    invalidDays.push(`${day} (closing time must be after opening time)`)
                }
            }
        })

        if (invalidDays.length > 0) {
            return NextResponse.json(
                {
                    error: "Invalid opening hours",
                    details: `Invalid hours for: ${invalidDays.join(", ")}`,
                },
                { status: 400 },
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

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
            message: "Opening hours updated successfully",
        })
    } catch (error) {
        console.error("Error updating opening hours:", error)

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
