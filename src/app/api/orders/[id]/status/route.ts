import { checkAuth } from "@/lib/auth/utils"
import { decrypt_key } from "@/lib/crypto-encrypt-and-decrypt"
import prisma from "@/lib/prisma"
import { sendEmailUsingResend } from "@/lib/resend"
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
            },
        })

        if (status === "delivered") {
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: order.restaurant_id },
                select: {
                    name: true,
                    email_from_name: true,
                    email_from_address: true,
                    email_api_key_encrypted: true,
                },
            });

            if (
                restaurant &&
                restaurant.email_from_name &&
                restaurant.email_from_address &&
                restaurant.email_api_key_encrypted &&
                order.customer_email
            ) {
                const html = `
<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px;">
    
    <h2 style="color: #111827; margin-bottom: 10px;">
      Your Order Has Been Delivered 🎉
    </h2>

    <p style="color: #374151; font-size: 15px;">
      Hi ${order.customer_name || "Valued Customer"},
    </p>

    <p style="color: #374151; font-size: 15px;">
      Great news! Your order <strong>#${order.order_number}</strong> has been successfully delivered.
    </p>

    <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 6px;">
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
      <p style="margin: 5px 0;"><strong>Total Paid:</strong> €${order.total_amount.toFixed(2)}</p>
    </div>

    <p style="color: #374151; font-size: 15px;">
      We truly hope you enjoy your meal! 🍽️
    </p>

    <p style="color: #374151; font-size: 15px; margin-top: 20px;">
      Thank you for choosing ${restaurant.name}. We appreciate your trust and look forward to serving you again.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

    <p style="font-size: 13px; color: #6b7280;">
      If you have any feedback or questions, feel free to contact us.
    </p>

  </div>
</div>
`;

                await sendEmailUsingResend({
                    type: "restaurant",
                    apiKey: decrypt_key(restaurant.email_api_key_encrypted),
                    to: order.customer_email,
                    fromEmail: restaurant.email_from_address,
                    fromName: restaurant.email_from_name,
                    subject: `Your Order ${order.order_number} Has Been Delivered`,
                    html,
                });
            }
        }

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
