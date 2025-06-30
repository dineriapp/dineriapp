import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateContactSchema = z.object({
    email: z.string().email("Please enter a valid email address").nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params
        const restaurantId = id
        const body = await request.json()

        // Validate request body
        const validatedData = updateContactSchema.parse(body)

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // Check if email is already taken by another restaurant (if email is being updated)
        if (validatedData.email && validatedData.email !== existingRestaurant.email) {
            const emailExists = await prisma.restaurant.findFirst({
                where: {
                    email: validatedData.email,
                    id: { not: restaurantId },
                },
            })

            if (emailExists) {
                return NextResponse.json({ error: "Email address is already in use by another restaurant" }, { status: 400 })
            }
        }

        // Update restaurant contact information
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                email: validatedData.email,
                phone: validatedData.phone,
                address: validatedData.address,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
            message: "Contact information updated successfully",
        })
    } catch (error) {
        console.error("Error updating contact information:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid data format", details: error.errors }, { status: 400 })
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
