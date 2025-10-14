import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { getUpdateEventSchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("event_api_messages")

    try {
        const { id } = await params
        const body = await request.json()
        const eventId = id

        const updateEventSchema = await getUpdateEventSchema();

        const validated = updateEventSchema.parse(body)

        // First get the event to check ownership
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId },
        })

        if (!existingEvent) {
            return NextResponse.json({ error: t("event_not_found") }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(existingEvent.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const event = await prisma.event.update({
            where: { id: eventId },
            data: {
                ...validated,
                date: new Date(validated.date),
            },
        })

        return NextResponse.json({ data: event })
    } catch (error) {
        console.error("Error updating event:", error)
        return NextResponse.json({ error: t("internal_server_error") }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("event_api_messages")
    try {

        const { id } = await params

        const eventId = id

        // First get the event to check ownership
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId },
        })

        if (!existingEvent) {
            return NextResponse.json({ error: t("event_not_found") }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(existingEvent.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        await prisma.event.delete({
            where: { id: eventId },
        })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error("Error deleting event:", error)
        return NextResponse.json({ error: t("internal_server_error") }, { status: 500 })
    }
}
