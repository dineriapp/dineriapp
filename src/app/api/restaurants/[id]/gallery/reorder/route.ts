import { authenticateAndAuthorize } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const auth = await authenticateAndAuthorize(id)
        if (auth.error) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const { items } = await req.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
        }

        await prisma.$transaction(
            items.map((item: { id: string; sort_order: number }) =>
                prisma.galleryItem.update({
                    where: { id: item.id, restaurant_id: id },
                    data: { sort_order: item.sort_order },
                })
            )
        );

        return NextResponse.json({ success: true, data: null });
    } catch (error) {
        console.error("Reorder error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}