import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        } = body

        // Validate required fields
        if (!bg_color || !accent_color || !headings_text_color || !button_text_icons_color) {
            return NextResponse.json({ error: "Missing required color fields" }, { status: 400 })
        }

        // Validate button style
        if (!["rounded", "square", "pill"].includes(button_style)) {
            return NextResponse.json({ error: "Invalid button style" }, { status: 400 })
        }

        // Validate button variant
        if (!["solid", "outline"].includes(button_variant)) {
            return NextResponse.json({ error: "Invalid button variant" }, { status: 400 })
        }

        // Validate background type
        if (!["color", "gradient", "image"].includes(bg_type)) {
            return NextResponse.json({ error: "Invalid background type" }, { status: 400 })
        }

        // Check if restaurant exists and belongs to user
        const existingRestaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                user_id: user.id,
            },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
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
                button_variant,
                bg_image_url: bg_image_url || null,
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
        })
    } catch (error) {
        console.error("Error updating restaurant appearance:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
