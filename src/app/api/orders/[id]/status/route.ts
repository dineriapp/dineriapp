import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()


        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        if (order.restaurant.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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
            message: `Order status updated to ${status}`,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
        }

        console.error("Update order status error:", error)
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }
}
