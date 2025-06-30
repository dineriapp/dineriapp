import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient()
        const { id } = await params
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const restaurantId = id

        // Check if restaurant exists and belongs to user
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                user_id: user.id,
            },
        })

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // Get all links for this restaurant
        const links = await prisma.link.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            orderBy: {
                sort_order: "asc",
            },
        })

        return NextResponse.json({
            success: true,
            data: links,
        })
    } catch (error) {
        console.error("Error fetching restaurant links:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
