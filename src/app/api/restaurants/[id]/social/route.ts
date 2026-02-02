import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { getTranslations } from "next-intl/server";

const updateSocialSchema = z.object({
    instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
    facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
    tiktok: z.string().url("Invalid TikTok URL").optional().or(z.literal("")),
    whatsapp: z
        .string()
        .regex(/^\+[1-9]\d{1,14}$/, "Invalid WhatsApp number format")
        .optional()
        .or(z.literal("")),
    social_icons_position: z.enum(["top", "bottom"]).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params
        const body = await request.json()

        console.log("Validated Data:", body);
        // Validate request body
        const validatedData = updateSocialSchema.parse(body)
        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 })
        }

        // Convert empty strings to null for database
        const dataToUpdate = {
            instagram: validatedData.instagram || null,
            facebook: validatedData.facebook || null,
            whatsapp: validatedData.whatsapp || null,
            tiktok: validatedData.tiktok || null,
            social_icons_position: validatedData.social_icons_position || "top",
        }

        // Update restaurant social media settings
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: dataToUpdate,
        })

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
            message: t("success.social_update_success"),
        })
    } catch (error) {
        console.error("Error updating social media settings:", error)

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
