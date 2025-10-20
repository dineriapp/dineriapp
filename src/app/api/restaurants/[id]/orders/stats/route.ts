import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authenticateAndAuthorize } from "@/lib/auth-utils"
import { getTranslations } from "next-intl/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const auth = await authenticateAndAuthorize(id)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Get all orders for calculations
        const allOrders = await prisma.order.findMany({
            where: {
                restaurant_id: id,
            },
            select: {
                total_amount: true,
                status: true,
                createdAt: true,
            },
        })

        // Calculate stats
        const totalOrders = allOrders.length
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total_amount, 0)
        const pendingOrders = allOrders.filter((order) =>
            ["pending", "confirmed", "preparing", "ready"].includes(order.status),
        ).length
        const completedOrders = allOrders.filter((order) => order.status === "delivered").length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Today's stats
        const todayOrders = allOrders.filter((order) => order.createdAt >= todayStart)
        const todayOrdersCount = todayOrders.length
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)

        // This week's stats
        const weekOrders = allOrders.filter((order) => order.createdAt >= weekStart)
        const weekOrdersCount = weekOrders.length
        const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total_amount, 0)

        // This month's stats
        const monthOrders = allOrders.filter((order) => order.createdAt >= monthStart)
        const monthOrdersCount = monthOrders.length
        const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0)

        return NextResponse.json({
            success: true,
            data: {
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                pending_orders: pendingOrders,
                completed_orders: completedOrders,
                average_order_value: averageOrderValue,
                today_orders: todayOrdersCount,
                today_revenue: todayRevenue,
                this_week_orders: weekOrdersCount,
                this_week_revenue: weekRevenue,
                this_month_orders: monthOrdersCount,
                this_month_revenue: monthRevenue,
            },
        })
    } catch (error) {
        const t = await getTranslations("restaurants_apis.errors");
        console.error("Get order stats error:", error)
        return NextResponse.json({ error: t("failed_fetch_orders_stats") }, { status: 500 })
    }
}
