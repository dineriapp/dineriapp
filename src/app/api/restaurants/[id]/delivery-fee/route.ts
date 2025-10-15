import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authenticateAndAuthorize } from "@/lib/auth-utils";
import { getTranslations } from "next-intl/server";


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {

        const schema = z.object({
            // accepts string or number, coerces to number
            delivery_fee: z.coerce.number().min(0, t("errors.delivery_fee_min")).max(9999, t("errors.delivery_fee_max"))
                .transform((n) => Math.round(n * 100) / 100), // round to 2 decimals
        });


        const { id } = await params;
        const body = await request.json();
        const { delivery_fee } = schema.parse(body);

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })

        }

        if (!authResult.data?.restaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 });
        }

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { delivery_fee },
            select: { id: true, delivery_fee: true },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: t("success.delivery_fee_update_success"),
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: t("errors.invalid_data"), details: error.errors }, { status: 400 });
        }
        console.error("Error updating delivery fee:", error);
        return NextResponse.json({ error: t("errors.internal_server_error") }, { status: 500 });
    }
}
