import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateSocialSchema = z.object({
    instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
    facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
    tiktok: z
        .string()
        .regex(/^@?[A-Za-z0-9._]{2,24}$/, {
            message: "Invalid TikTok username",
        })
        .optional()
        .or(z.literal("")), whatsapp: z
            .string()
            .regex(/^\+[1-9]\d{1,14}$/, "Invalid WhatsApp number format")
            .optional()
            .or(z.literal("")),
    social_icons_position: z.enum(["top", "bottom"]).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate request body
        const validatedData = updateSocialSchema.parse(body)

        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { id },
        })

        if (!existingRestaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
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
            message: "Social media settings updated successfully",
        })
    } catch (error) {
        console.error("Error updating social media settings:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors,
                },
                { status: 400 },
            )
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
