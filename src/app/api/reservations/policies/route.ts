import prisma from "@/lib/prisma"; // adjust if your prisma client path is different
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const defaultCreateData = {
    cancellation_policy: "Enter policy here",
    cancellation_enabled: true,

    deposit_policy: "Enter policy here",
    deposit_enabled: true,

    dining_policy: "Enter policy here",
    dining_enabled: true,

    no_show_policy: "Enter policy here",
    no_show_enabled: true,
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get("restaurantId");

        if (!restaurantId) {
            return NextResponse.json(
                { success: false, error: "restaurantId is required" },
                { status: 400 }
            );
        }

        // If Restaurant.id is UUID, keep this:
        if (!z.string().uuid().safeParse(restaurantId).success) {
            return NextResponse.json(
                { success: false, error: "Invalid restaurantId" },
                { status: 400 }
            );
        }

        const policy = await prisma.reservationPolicy.findUnique({
            where: { restaurant_id: restaurantId },
        });

        if (!policy) {
            return NextResponse.json(
                { success: false, error: "NOT_FOUND" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: policy }, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

const putSchema = z.object({
    restaurantId: z.string().uuid(),
    type: z.enum(["cancellation", "deposit", "dining", "no_show"]),
    text: z.string().min(1, "text is required"),
    enabled: z.boolean(),
});

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = putSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { restaurantId, type, text, enabled } = parsed.data;

        // Map the incoming "type" to your Prisma fields
        const updateData =
            type === "cancellation"
                ? { cancellation_policy: text, cancellation_enabled: enabled }
                : type === "deposit"
                    ? { deposit_policy: text, deposit_enabled: enabled }
                    : type === "dining"
                        ? { dining_policy: text, dining_enabled: enabled }
                        : { no_show_policy: text, no_show_enabled: enabled };

        // Upsert = create if not exists, otherwise update
        const saved = await prisma.reservationPolicy.upsert({
            where: { restaurant_id: restaurantId },
            create: {
                restaurant_id: restaurantId,
                ...defaultCreateData,
                ...updateData, // override defaults for the one being saved
            },
            update: updateData,
        });

        return NextResponse.json({ success: true, data: saved }, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
