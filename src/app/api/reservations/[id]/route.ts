import { type NextRequest, NextResponse } from "next/server"
import type { ReservationResponse } from "@/lib/types"
import prisma from "@/lib/prisma"

// PUT /api/reservations/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
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
            specialRequest,
            status,
            tableIds,
            payment,
        } = body

        const updateData: any = {}

        if (name !== undefined) updateData.name = name
        if (email !== undefined) updateData.email = email
        if (phone !== undefined) updateData.phone = phone
        if (fromTime !== undefined) updateData.fromTime = fromTime
        if (endTime !== undefined) updateData.endTime = endTime
        if (partySize !== undefined) updateData.partySize = partySize
        if (preferredArea !== undefined) updateData.preferredArea = preferredArea
        if (specialRequest !== undefined) updateData.specialRequest = specialRequest
        if (status !== undefined) {
            updateData.status = status
            if (status === "CONFIRMED") updateData.confirmedAt = new Date()
            if (status === "CANCELLED") updateData.cancelledAt = new Date()
        }

        if (date !== undefined) {
            const reservationDate = new Date(date)
            updateData.date = reservationDate
            updateData.day = reservationDate.getDate()
            updateData.month = reservationDate.getMonth() + 1
            updateData.year = reservationDate.getFullYear()
        }

        // Handle table updates
        if (tableIds !== undefined) {
            await prisma.tableOnReservation.deleteMany({
                where: { reservationId: id },
            })

            if (tableIds.length > 0) {
                await prisma.tableOnReservation.createMany({
                    data: tableIds.map((tableId: string) => ({
                        reservationId: id,
                        tableId,
                        assignedAt: new Date(),
                    })),
                })
            }
        }

        // Handle payment updates
        if (payment !== undefined) {
            const existingPayment = await prisma.payment.findUnique({
                where: { reservationId: id },
            })

            if (existingPayment) {
                await prisma.payment.update({
                    where: { reservationId: id },
                    data: {
                        ...(payment.paidAmount !== undefined && { paidAmount: payment.paidAmount }),
                        ...(payment.totalAmount !== undefined && { totalAmount: payment.totalAmount }),
                        ...(payment.paymentStatus !== undefined && { paymentStatus: payment.paymentStatus }),
                        ...(payment.method !== undefined && { method: payment.method }),
                    },
                })
            } else {
                await prisma.payment.create({
                    data: {
                        reservationId: id,
                        paidAmount: payment.paidAmount || 0,
                        totalAmount: payment.totalAmount || 0,
                        currency: payment.currency || "EUR",
                        paymentStatus: payment.paymentStatus || "PENDING",
                        method: payment.method,
                    },
                })
            }
        }

        const reservation = await prisma.reservation.update({
            where: { id },
            data: updateData,
            include: {
                payment: true,
                tableLinks: {
                    include: {
                        table: true,
                    },
                },
            },
        })

        return NextResponse.json<ReservationResponse>({
            success: true,
            data: reservation,
        })
    } catch (error) {
        console.error("[Reservations PUT]", error)
        return NextResponse.json<ReservationResponse>(
            { success: false, error: "Failed to update reservation" },
            { status: 500 },
        )
    }
}

// DELETE /api/reservations/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params

        // Delete related records
        await prisma.tableOnReservation.deleteMany({
            where: { reservationId: id },
        })

        await prisma.payment.deleteMany({
            where: { reservationId: id },
        })

        await prisma.reservation.delete({
            where: { id },
        })

        return NextResponse.json<ReservationResponse>({
            success: true,
        })
    } catch (error) {
        console.error("[Reservations DELETE]", error)
        return NextResponse.json<ReservationResponse>(
            { success: false, error: "Failed to delete reservation" },
            { status: 500 },
        )
    }
}
