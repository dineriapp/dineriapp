import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateIntegrationsSchema = z.object({
    google_place_id: z.string().optional().nullable(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate request body
        const validatedData = updateIntegrationsSchema.parse(body)

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // Update restaurant
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                google_place_id: validatedData.google_place_id || null,
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
