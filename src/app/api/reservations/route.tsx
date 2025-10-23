import { type NextRequest, NextResponse } from "next/server"
import type { ReservationResponse, ReservationsListResponse } from "@/lib/types"
import prisma from "@/lib/prisma"

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
                tableLinks: {
                    include: {
                        table: true,
                    },
                },
            },
            orderBy: { date: "desc" },
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

// POST /api/reservations
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            name,
            email,
            phone,
            date,
            fromTime,
            endTime,
            partySize,
            preferredArea,
            restaurant_id,
            specialRequest,
            status = "PENDING",
            source = "PHONE",
            tableIds = [],
            payment,
            timezone,
        } = body

        if (!name || !email || !date || !fromTime || !endTime || !partySize || !restaurant_id) {
            return NextResponse.json<ReservationResponse>(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            )
        }

        const reservationDate = new Date(date)
        const day = reservationDate.getDate()
        const month = reservationDate.getMonth() + 1
        const year = reservationDate.getFullYear()

        const reservation = await prisma.reservation.create({
            data: {
                name,
                email,
                phone,
                date: reservationDate,
                day,
                month,
                year,
                fromTime,
                endTime,
                partySize,
                preferredArea,
                specialRequest,
                restaurant_id: restaurant_id,
                status,
                source,
                timezone,
                ...(payment && {
                    payment: {
                        create: {
                            paidAmount: payment.paidAmount,
                            totalAmount: payment.totalAmount,
                            currency: payment.currency || "EUR",
                            paymentStatus: payment.paymentStatus || "PENDING",
                            method: payment.method,
                        },
                    },
                }),
                ...(tableIds.length > 0 && {
                    tableLinks: {
                        create: tableIds.map((tableId: string) => ({
                            tableId,
                            assignedAt: new Date(),
                        })),
                    },
                }),
            },
            include: {
                payment: true,
                tableLinks: {
                    include: {
                        table: true,
                    },
                },
            },
        })

        return NextResponse.json<ReservationResponse>({ success: true, data: reservation }, { status: 201 })
    } catch (error) {
        console.error("[Reservations POST]", error)
        return NextResponse.json<ReservationResponse>(
            { success: false, error: "Failed to create reservation" },
            { status: 500 },
        )
    }
}
