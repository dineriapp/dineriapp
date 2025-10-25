import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { restaurantId, settings } = body;

        if (!restaurantId || !settings) {
            return NextResponse.json(
                { error: "Missing restaurantId or settings" },
                { status: 400 }
            );
        }

        const result = await prisma.reservationSettings.upsert({
            where: { restaurant_id: restaurantId },
            create: {
                restaurant_id: restaurantId,
                settings,
            },
            update: {
                settings,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Settings saved successfully",
            data: result,
        });
    } catch (error) {
        console.error("❌ Failed to save settings:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get("restaurantId");

        if (!restaurantId) {
            return NextResponse.json(
                { error: "Missing restaurantId" },
                { status: 400 }
            );
        }

        const settings = await prisma.reservationSettings.findUnique({
            where: { restaurant_id: restaurantId },
        });

        return NextResponse.json({
            success: true,
            settings: settings?.settings || {},
        });
    } catch (error) {
        console.error("❌ Failed to fetch settings:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
