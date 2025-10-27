import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis.errors");

    try {
        const { id } = await params

        const session = await checkAuth()

        if (!session || !session?.user) {
            return NextResponse.json({ error: t("unauthorized") }, { status: 401 })
        }

        const restaurantId = id

        // Check if restaurant exists and belongs to user
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                user_id: session.user.id,
            },
        })

        if (!restaurant) {
            return NextResponse.json({ error: t("restaurants_not_found") }, { status: 404 })
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
        return NextResponse.json({ error: t("internal_server_error") }, { status: 500 })
    }
}
