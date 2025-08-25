import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authenticateAndAuthorize } from "@/lib/auth-utils";

const schema = z.object({
    // accepts string or number, coerces to number
    delivery_fee: z.coerce.number().min(0, "Delivery fee cannot be negative").max(9999, "Fee is too large")
        .transform((n) => Math.round(n * 100) / 100), // round to 2 decimals
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { delivery_fee } = schema.parse(body);

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })

        }

        if (!authResult.data?.restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { delivery_fee },
            select: { id: true, delivery_fee: true },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: "Delivery fee updated successfully",
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
        }
        console.error("Error updating delivery fee:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
