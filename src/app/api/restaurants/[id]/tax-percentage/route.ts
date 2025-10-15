import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authenticateAndAuthorize } from "@/lib/auth-utils";




export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const schema = z.object({
            // accepts string or number, coerces to number
            tax_percentage: z.coerce
                .number()
                .min(0, "Tax percentage cannot be negative")
                .max(100, "Tax percentage cannot exceed 100")
                .transform((n) => Math.round(n * 100) / 100), // round to 2 decimals
        });
        const { tax_percentage } = schema.parse(body);

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })

        }

        if (!authResult.data?.restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { tax_percentage },
            select: { id: true, delivery_fee: true },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: "Tax percentage updated successfully",
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
        }
        console.error("Error updating tax percentage:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
