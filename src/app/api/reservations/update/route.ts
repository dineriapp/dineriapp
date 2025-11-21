
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reservationId, status } = body;

        if (!reservationId || !status) {
            return NextResponse.json(
                { success: false, error: "Missing reservationId or status" },
                { status: 400 }
            );
        }

        const updated = await prisma.reservation.update({
            where: { id: reservationId },
            data: { status },
        });

        return NextResponse.json({
            success: true,
            data: updated,
        });

    } catch (error) {
        console.error("Update Status Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update status" },
            { status: 500 }
        );
    }
}
