import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authenticateAndAuthorize } from "@/lib/auth-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const auth = await authenticateAndAuthorize(id)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const paymentStatus = searchParams.get("paymentStatus")
        const orderType = searchParams.get("orderType")
        const dateRange = searchParams.get("dateRange")
        const search = searchParams.get("search")

        // Build where clause
        const where: any = {
            restaurant_id: id,
        }

        if (status && status !== "all") {
            where.status = status
        }

        if (paymentStatus && paymentStatus !== "all") {
            where.payment_status = paymentStatus
        }

        if (orderType && orderType !== "all") {
            where.order_type = orderType
        }

        if (dateRange && dateRange !== "all") {
            const now = new Date()
            let startDate: Date

            switch (dateRange) {
                case "today":
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                    break
                case "week":
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case "month":
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    break
                default:
                    startDate = new Date(0)
            }

            where.created_at = {
                gte: startDate,
            }
        }

        if (search) {
            where.OR = [
                { order_number: { contains: search, mode: "insensitive" } },
                { customer_name: { contains: search, mode: "insensitive" } },
                { customer_email: { contains: search, mode: "insensitive" } },
            ]
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        // Generate CSV
        const csvHeaders = [
            "Order Number",
            "Customer Name",
            "Customer Email",
            "Customer Phone",
            "Order Type",
            "Status",
            "Payment Status",
            "Subtotal",
            "Tax Amount",
            "Delivery Fee",
            "Total Amount",
            "Items Count",
            "Special Instructions",
            "Delivery Address",
            "Created At",
            "Updated At",
        ]

        const csvRows = orders.map((order) => [
            order.order_number,
            order.customer_name,
            order.customer_email,
            order.customer_phone || "",
            order.order_type,
            order.status,
            order.payment_status,
            order.subtotal.toFixed(2),
            order.tax_amount.toFixed(2),
            order.delivery_fee.toFixed(2),
            order.total_amount.toFixed(2),
            order.items.length,
            order.special_instructions || "",
            order.delivery_address || "",
            new Date(order.createdAt).toISOString(),
            new Date(order.updatedAt).toISOString(),
        ])

        const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

        return new Response(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        })
    } catch (error) {
        console.error("Export orders error:", error)
        return NextResponse.json({ error: "Failed to export orders" }, { status: 500 })
    }
}
