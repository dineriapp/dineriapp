import { authenticateAndAuthorize } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { taxPercentageSchema } from "@/lib/validations";
import { getTranslations } from "next-intl/server";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";




export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("restaurants_apis");

    try {
        const { id } = await params;
        const body = await request.json();

        const { tax_percentage } = taxPercentageSchema.parse(body);

        const authResult = await authenticateAndAuthorize(id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })

        }

        if (!authResult.data?.restaurant) {
            return NextResponse.json({ error: t("errors.restaurant_not_found") }, { status: 404 });
        }

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { tax_percentage },
            select: { id: true, delivery_fee: true },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: t("success.tax_update_success"),
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: t("errors.invalid_data"), details: error.errors }, { status: 400 });
        }
        console.error("Error updating tax percentage:", error);
        return NextResponse.json(
            { error: t("errors.internal_server_error") },
            { status: 500 }
        );
    }
}
