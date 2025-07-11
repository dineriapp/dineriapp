import { authenticateAndAuthorize, checkSubscriptionLimitsWithPlans } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { createCategorySchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurant_id")
        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 })
        }

        const categories = await prisma.menuCategory.findMany({
            where: { restaurant_id: restaurantId },
            include: {
                items: {
                    orderBy: { sort_order: "asc" },
                },
            },
            orderBy: { sort_order: "asc" },
        })

        return NextResponse.json({ data: categories })
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {

        const body = await request.json()
        const validated = createCategorySchema.parse(body)

        const authResult = await authenticateAndAuthorize(validated.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user, restaurant } = authResult.data!

        // Check subscription limits before creating link
        const limitResult = await checkSubscriptionLimitsWithPlans(user.id, restaurant.id, "menu_categories")
        if (limitResult.error) {
            return NextResponse.json({ error: limitResult.error }, { status: limitResult.status || 500 })
        }

        const lastCategory = await prisma.menuCategory.findFirst({
            where: { restaurant_id: validated.restaurant_id },
            orderBy: { sort_order: "desc" },
        })

        const category = await prisma.menuCategory.create({
            data: {
                ...validated,
                name: validated.name.trim(),
                description: validated.description?.trim(),
                sort_order: lastCategory ? lastCategory.sort_order + 1 : 0,
            },
            include: {
                items: {
                    orderBy: { sort_order: "asc" },
                },
            },
        })

        return NextResponse.json({ data: category })
    } catch (error) {
        console.error("Error creating category:", error)
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }
}
