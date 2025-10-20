import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updatePopupsSchema = z.object({
    welcome_popup_enabled: z.boolean().optional(),
    welcome_popup_message: z.string().max(200, "Message too long").optional(),
    welcome_popup_delay: z.number().min(1).max(10).optional(),
    welcome_popup_show_button: z.boolean().optional(),
    welcome_popup_show_info: z
        .object({
            ratings: z.boolean(),
            address: z.boolean(),
            hours: z.boolean(),
            phone: z.boolean(),
        })
        .optional(),
    menu_popup_enabled: z.boolean().optional(),
    menu_popup_message: z.string().max(200, "Message too long").optional(),
    menu_popup_delay: z.number().min(1).max(10).optional(),
    menu_popup_show_button: z.boolean().optional(),
    menu_popup_show_info: z
        .object({
            ratings: z.boolean(),
            address: z.boolean(),
            hours: z.boolean(),
            phone: z.boolean(),
        })
        .optional(),
    event_announcements_enabled: z.boolean().optional(),
    event_announcement_days: z.number().min(1).max(365).optional(),
    max_events_in_popup: z.number().min(1).max(10).optional(),
    event_rotation_speed: z.number().min(1).max(30).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params
        const body = await request.json()

        // Validate request body
        const validatedData = updatePopupsSchema.parse(body)

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 })
        }

        // Prepare update data
        const updateData: any = {}

        if (validatedData.welcome_popup_enabled !== undefined) {
            updateData.welcome_popup_enabled = validatedData.welcome_popup_enabled
        }
        if (validatedData.welcome_popup_message !== undefined) {
            updateData.welcome_popup_message = validatedData.welcome_popup_message
        }
        if (validatedData.welcome_popup_delay !== undefined) {
            updateData.welcome_popup_delay = validatedData.welcome_popup_delay
        }
        if (validatedData.welcome_popup_show_button !== undefined) {
            updateData.welcome_popup_show_button = validatedData.welcome_popup_show_button
        }
        if (validatedData.welcome_popup_show_info !== undefined) {
            updateData.welcome_popup_show_info = validatedData.welcome_popup_show_info
        }
        if (validatedData.menu_popup_enabled !== undefined) {
            updateData.menu_popup_enabled = validatedData.menu_popup_enabled
        }
        if (validatedData.menu_popup_message !== undefined) {
            updateData.menu_popup_message = validatedData.menu_popup_message
        }
        if (validatedData.menu_popup_delay !== undefined) {
            updateData.menu_popup_delay = validatedData.menu_popup_delay
        }
        if (validatedData.menu_popup_show_button !== undefined) {
            updateData.menu_popup_show_button = validatedData.menu_popup_show_button
        }
        if (validatedData.menu_popup_show_info !== undefined) {
            updateData.menu_popup_show_info = validatedData.menu_popup_show_info
        }
        if (validatedData.event_announcements_enabled !== undefined) {
            updateData.event_announcements_enabled = validatedData.event_announcements_enabled
        }
        if (validatedData.event_announcement_days !== undefined) {
            updateData.event_announcement_days = validatedData.event_announcement_days
        }
        if (validatedData.max_events_in_popup !== undefined) {
            updateData.max_events_in_popup = validatedData.max_events_in_popup
        }
        if (validatedData.event_rotation_speed !== undefined) {
            updateData.event_rotation_speed = validatedData.event_rotation_speed
        }

        // Update restaurant
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                ...updateData,
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
            message: t("success.popup_update_success"),
        })
    } catch (error) {
        console.error("Error updating popup settings:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: t("errors.validation_failed"),
                    details: error.errors,
                },
                { status: 400 },
            )
        }

        return NextResponse.json({ error: t("errors.internal_server_error") }, { status: 500 })
    }
}
