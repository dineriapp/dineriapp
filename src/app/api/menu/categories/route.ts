import prisma from "@/lib/prisma"
import { createCategorySchema } from "@/lib/validations"
import { createClient } from "@/supabase/clients/server"
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


        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const prismaUser = await prisma.user.findFirst({
            where: { id: data.user.id },
        })

        if (!prismaUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const body = await request.json()
        const validated = createCategorySchema.parse(body)

        // ✅ Check restaurant ownership
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: validated.restaurant_id },
        })

        if (!restaurant || restaurant.user_id !== data.user.id) {
            return NextResponse.json(
                { error: "Unauthorized: You do not own this restaurant." },
                { status: 403 }
            )
        }

        // ✅ Limit number of categories
        const categoryCount = await prisma.menuCategory.count({
            where: { restaurant_id: validated.restaurant_id },
        })

        if (prismaUser.subscription_plan === "basic" && categoryCount >= 4) {
            return NextResponse.json(
                { error: "You are limited to 4 menu categories on the Basic plan." },
                { status: 403 }
            )
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
