import prisma from "@/lib/prisma"
import type { ReservationsListResponse } from "@/lib/types"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/reservations?restaurantId=xxx
export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurantId")

        if (!restaurantId) {
            return NextResponse.json<ReservationsListResponse>(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            )
        }

        const reservations = await prisma.reservation.findMany({
            where: {
                // Filter by restaurant through tableLinks if needed, or add restaurant_id to Reservation model
            },
            include: {
                payment: true,
                table_reservations: {
                    include: {
                        table: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json<ReservationsListResponse>({
            success: true,
            data: reservations,
        })
    } catch (error) {
        console.error("[Reservations GET]", error)
        return NextResponse.json<ReservationsListResponse>(
            { success: false, error: "Failed to fetch reservations" },
            { status: 500 },
        )
    }
}

