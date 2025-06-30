import { type NextRequest, NextResponse } from "next/server"
import { authenticateAndAuthorize } from "@/lib/auth-utils"
import { z } from "zod"
import prisma from "@/lib/prisma"

const updateRestaurantSchema = z.object({
    name: z.string().min(1, "Restaurant name is required").max(100, "Restaurant name must be less than 100 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(50, "Slug must be less than 50 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
    logo_url: z.string().url("Logo URL must be a valid URL").nullable().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const restaurantId = id

        // Authenticate and authorize
        const authResult = await authenticateAndAuthorize(restaurantId)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status })
        }

        const { restaurant } = authResult.data!

        // Parse and validate request body
        const body = await request.json()
        const validatedData = updateRestaurantSchema.parse(body)

        // Check if slug is unique (excluding current restaurant)
        if (validatedData.slug !== restaurant.slug) {
            const existingRestaurant = await prisma.restaurant.findFirst({
                where: {
                    slug: validatedData.slug,
                    id: { not: restaurantId },
                },
            })

            if (existingRestaurant) {
                return NextResponse.json(
                    { error: "This page URL is already taken. Please choose a different one." },
                    { status: 409 },
                )
            }
        }

        // Update restaurant
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                name: validatedData.name,
                slug: validatedData.slug,
                bio: validatedData.bio || null,
                logo_url: validatedData.logo_url || null,
            },
        })

        return NextResponse.json({
            data: updatedRestaurant,
            message: "Restaurant updated successfully",
        })
    } catch (error) {
        console.error("Error updating restaurant:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                },
                { status: 400 },
            )
        }

        return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 })
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const restaurantId = id

        // Authenticate and authorize
        const authResult = await authenticateAndAuthorize(restaurantId)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status })
        }

        const { restaurant } = authResult.data!

        return NextResponse.json({
            data: restaurant,
        })
    } catch (error) {
        console.error("Error fetching restaurant:", error)
        return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 })
    }
}
