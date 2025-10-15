import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"
import { getTranslations } from "next-intl/server"

export async function GET(request: NextRequest) {
    const t = await getTranslations("qr_code_apis.error")

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: t("unauthorized") }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurant_id")

        if (!restaurantId) {
            return NextResponse.json({ error: t("restaurant_id_required") }, { status: 400 })
        }

        // Verify user owns the restaurant
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { user_id: true },
        })

        if (!restaurant || restaurant.user_id !== user.id) {
            return NextResponse.json({ error: t("restaurant_not_found") }, { status: 404 })
        }

        // Get QR codes with stats
        const qrCodes = await prisma.qr_codes.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            include: {
                link: {
                    select: {
                        id: true,
                        title: true,
                        url: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        })

        const totalQRCodes = qrCodes.length
        const activeQRCodes = qrCodes.filter((qr) => qr.is_active).length
        const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)

        return NextResponse.json({
            qrCodes,
            totalQRCodes,
            activeQRCodes,
            totalScans,
        })
    } catch (error) {
        console.error("Error in QR code stats GET:", error)
        return NextResponse.json({ error: t("internal_server_error") }, { status: 500 })
    }
}
