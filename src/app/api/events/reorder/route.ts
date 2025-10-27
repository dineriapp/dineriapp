import { checkAuth } from "@/lib/auth/utils"
import prisma from "@/lib/prisma"
import { getReorderEventSchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
    const t = await getTranslations("event_api_messages")

    try {
        const session = await checkAuth()

        if (!session?.user) {
            return NextResponse.json({ error: t("not_authenticated") }, { status: 401 })
        }

        const body = await request.json()
        const reorderEventSchema = await getReorderEventSchema()
        const validated = reorderEventSchema.parse(body)

        // Check if event exists and user owns it
        const event = await prisma.event.findUnique({
            where: { id: validated.eventId },
            include: { restaurant: true },
        })

        if (!event) {
            return NextResponse.json({ error: t("event_not_found") }, { status: 404 })
        }

        if (event.restaurant.user_id !== session.user.id) {
            return NextResponse.json({ error: t("unauthorized_event") }, { status: 403 })
        }

        // Get all events for this restaurant ordered by sort_order
        const allEvents = await prisma.event.findMany({
            where: { restaurant_id: event.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        const currentIndex = allEvents.findIndex((e) => e.id === validated.eventId)
        if (currentIndex === -1) {
            return NextResponse.json({ error: t("event_not_found_in_list") }, { status: 404 })
        }

        const newIndex = validated.direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0 || newIndex >= allEvents.length) {
            return NextResponse.json({ error: t("cannot_move_event") }, { status: 400 })
        }

        // Swap the sort orders
        const currentEvent = allEvents[currentIndex]
        const targetEvent = allEvents[newIndex]

        await prisma.$transaction([
            prisma.event.update({
                where: { id: currentEvent.id },
                data: { sort_order: targetEvent.sort_order },
            }),
            prisma.event.update({
                where: { id: targetEvent.id },
                data: { sort_order: currentEvent.sort_order },
            }),
        ])

        // Return updated events list
        const updatedEvents = await prisma.event.findMany({
            where: { restaurant_id: event.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        return NextResponse.json({ data: updatedEvents })
    } catch (error) {
        console.error("Error reordering event:", error)
        return NextResponse.json({ error: t("failed_to_reorder_event") }, { status: 500 })
    }
}
