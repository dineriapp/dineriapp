import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const deleted = await prisma.reservationQuery.delete({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        return NextResponse.json(deleted);
    } catch (error) {
        console.error("Delete reservation query error:", error);
        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json(
                { error: "Reservation query not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete reservation query" },
            { status: 500 }
        );
    }
}
