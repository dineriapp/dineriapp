import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authenticateAndAuthorize } from "@/lib/auth-utils";
import { getTranslations } from "next-intl/server";

const updateStatusSchema = z.object({
    status: z.enum(["ALLOKAY", "DISABLE_DELIVERY", "DISABLE_PICKUP", "DISABLE_BOTH"]),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params;
        const body = await request.json();

        const { status } = updateStatusSchema.parse(body);

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        // Make sure the restaurant exists
        const restaurant = authResult.data?.restaurant
        if (!restaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 });
        }

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                status: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: t("success.status_update_success"),
        });
    } catch (error) {
        console.error("Error updating status:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: t("errors.invalid_data_format"), details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: t("errors.internal_server_error") }, { status: 500 });
    }
}
