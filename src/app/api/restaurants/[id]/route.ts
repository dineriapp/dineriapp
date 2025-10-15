import { type NextRequest, NextResponse } from "next/server"
import { authenticateAndAuthorize } from "@/lib/auth-utils"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"



export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");
    const schema = await getTranslations("restaurants_apis.schema.update_restaurant");

    try {
        const { id } = await params
        const restaurantId = id

        const updateRestaurantSchema = z.object({
            name: z.string().min(1, schema("name_required")).max(100, schema("name_max")),
            slug: z
                .string()
                .min(3, schema("slug_min"))
                .max(50, schema("slug_max"))
                .regex(/^[a-z0-9-]+$/, schema("slug_pattern")),
            bio: z.string().max(200, schema("bio_max")).optional(),
            logo_url: z.string().url(schema("logo_url_invalid")).nullable().optional(),
        })

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
                    { error: t("errors.page_url_taken") },
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
            message: t("success.restaurant_update_success"),
        })
    } catch (error) {
        console.error("Error updating restaurant:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: t("errors.validation_failed"),
                    details: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                },
                { status: 400 },
            )
        }

        return NextResponse.json({ error: t("errors.failed_update_restaurant") }, { status: 500 })
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
        const t = await getTranslations("restaurants_apis.errors");

        console.error("Error fetching restaurant:", error)
        return NextResponse.json({ error: t("failed_fetch_restaurant") }, { status: 500 })
    }
}
