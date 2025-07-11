import { type NextRequest, NextResponse } from "next/server"
import { createEventSchema } from "@/lib/validations"
import { authenticateAndAuthorize, checkSubscriptionLimitsWithPlans } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurant_id")

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
        }

        const authResult = await authenticateAndAuthorize(restaurantId)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const events = await prisma.event.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            orderBy: {
                sort_order: "asc",
            },
        })

        return NextResponse.json({ data: events })
    } catch (error) {
        console.error("Error fetching events:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validated = createEventSchema.parse(body)

        const authResult = await authenticateAndAuthorize(validated.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user, restaurant } = authResult.data!

        // Check subscription limits
        const limitResult = await checkSubscriptionLimitsWithPlans(user.id, restaurant.id, "events")
        if (limitResult.error) {
            return NextResponse.json({ error: limitResult.error }, { status: limitResult.status || 500 })
        }

        // Get the next sort order
        const lastEvent = await prisma.event.findFirst({
            where: { restaurant_id: validated.restaurant_id },
            orderBy: { sort_order: "desc" },
        })

        const nextSortOrder = lastEvent ? lastEvent.sort_order + 1 : 0

        const event = await prisma.event.create({
            data: {
                ...validated,
                date: new Date(validated.date),
                sort_order: nextSortOrder,
            },
        })

        return NextResponse.json({ data: event }, { status: 201 })
    } catch (error) {
        console.error("Error creating event:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
