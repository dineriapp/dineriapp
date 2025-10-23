import prisma from "@/lib/prisma"
import type { ReservationStatsResponse } from "@/lib/types"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/reservations/stats?restaurantId=xxx
export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurantId")

        if (!restaurantId) {
            return NextResponse.json<ReservationStatsResponse>(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            )
        }

        const [total, confirmed, pending, cancelled, checkedIn] = await Promise.all([
            prisma.reservation.count(),
            prisma.reservation.count({ where: { status: "CONFIRMED" } }),
            prisma.reservation.count({ where: { status: "PENDING" } }),
            prisma.reservation.count({ where: { status: "CANCELLED" } }),
            prisma.reservation.count({ where: { checkedInAt: { not: null } } }),
        ])

        return NextResponse.json<ReservationStatsResponse>({
            success: true,
            data: {
                total,
                confirmed,
                pending,
                cancelled,
                checkedIn,
            },
        })
    } catch (error) {
        console.error("[Reservations Stats GET]", error)
        return NextResponse.json<ReservationStatsResponse>(
            { success: false, error: "Failed to fetch stats" },
            { status: 500 },
        )
    }
}
