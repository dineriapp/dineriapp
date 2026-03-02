import prisma from "@/lib/prisma"
import type { ReservationsListResponse, ReservationsPaymentsListResponse } from "@/lib/types"
import { type NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurantId")

        if (!restaurantId) {
            return NextResponse.json<ReservationsListResponse>(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            )
        }

        const payments = await prisma.payment.findMany({
            where: {
                reservation: {
                    restaurant_id: restaurantId,
                },
            },
            include: {
                reservation: {
                    select: {
                        customer_name: true,
                        customer_email: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json<ReservationsPaymentsListResponse>({
            success: true,
            data: payments,
        })
    } catch (error) {
        console.error("[Reservations Payments GET]", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch payments" },
            { status: 500 },
        )
    }
}


