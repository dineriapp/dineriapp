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

        const orders = await prisma.order.findMany({
            where: {
                restaurant_id: id,
            },
            include: {
                items: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json({
            success: true,
            data: orders,
        })
    } catch (error) {
        const t = await getTranslations("restaurants_apis.errors");
        console.error("Get orders error:", error)
        return NextResponse.json({ error: t("failed_fetch_orders") }, { status: 500 })
    }
}
