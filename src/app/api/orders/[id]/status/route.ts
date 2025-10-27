import { checkAuth } from "@/lib/auth/utils"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("orders_apis")
    try {
        const { id } = await params

        const session = await checkAuth()


        if (!session?.user) {
            return NextResponse.json({ error: t("error_unauthorized") }, { status: 401 })
        }

        const body = await request.json()
        const { status } = updateStatusSchema.parse(body)

        // Get the order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id: id },
            include: {
                restaurant: {
                    select: {
                        user_id: true,
                    },
                },
            },
        })

        if (!order) {
            return NextResponse.json({ error: t("error_order_not_found") }, { status: 404 })
        }

        if (order.restaurant.user_id !== session?.user.id) {
            return NextResponse.json({ error: t("error_unauthorized") }, { status: 403 })
        }

        // Update the order status
        const updatedOrder = await prisma.order.update({
            where: { id: id },
            data: {
                status,
                createdAt: new Date(),
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: t("success_order_status_updated_to", { status: status }),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: t("error_invalid_input"), details: error.errors }, { status: 400 })
        }

        console.error("Update order status error:", error)
        return NextResponse.json({ error: t("success_order_status_updated_to") }, { status: 500 })
    }
}
