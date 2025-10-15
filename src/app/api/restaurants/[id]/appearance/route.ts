import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"
import { getTranslations } from "next-intl/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis.errors");

    try {
        const supabase = await createClient()

        const { id } = await params

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: t("unauthorized") }, { status: 401 })
        }

        const restaurantId = id
        const body = await request.json()

        const {
            bg_color,
            accent_color,
            headings_text_color,
            button_text_icons_color,
            button_style,
            font_family,
            bg_type,
            bg_gradient_start,
            bg_gradient_end,
            gradient_direction,
            button_variant,
            bg_image_url,
            social_icon_bg_color,
            social_icon_color,
            button_icons_show,
            buttons_gap_in_px,
            social_icon_gap,
            social_icon_bg_show
        } = body

        // Validate required fields
        if (!bg_color || !accent_color || !headings_text_color || !button_text_icons_color) {
            return NextResponse.json({ error: t("missing_required_color_fields") }, { status: 400 })
        }

        // Validate button style
        if (!["rounded", "square", "pill"].includes(button_style)) {
            return NextResponse.json({ error: t("invalid_button_style") }, { status: 400 })
        }

        // Validate button variant
        if (!["solid", "outline"].includes(button_variant)) {
            return NextResponse.json({ error: t("invalid_button_variant") }, { status: 400 })
        }

        // Validate background type
        if (!["color", "gradient", "image"].includes(bg_type)) {
            return NextResponse.json({ error: t("invalid_background_type") }, { status: 400 })
        }

        // Check if restaurant exists and belongs to user
        const existingRestaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                user_id: user.id,
            },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: t("restaurant_not_found") }, { status: 404 })
        }

        // Update restaurant appearance
        const updatedRestaurant = await prisma.restaurant.update({
            where: {
                id: restaurantId,
            },
            data: {
                bg_color,
                accent_color,
                headings_text_color,
                button_text_icons_color,
                button_style,
                font_family,
                bg_type,
                bg_gradient_start,
                bg_gradient_end,
                gradient_direction,
                social_icon_bg_show,
                social_icon_bg_color,
                social_icon_gap,
                social_icon_color,
                buttons_gap_in_px: Number(buttons_gap_in_px),
                button_variant,
                button_icons_show: button_icons_show,
                bg_image_url: bg_image_url || null,
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
        })
    } catch (error) {
        console.error("Error updating restaurant appearance:", error)
        return NextResponse.json({ error: t("internal_server_error") }, { status: 500 })
    }
}
