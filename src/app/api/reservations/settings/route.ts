import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { restaurantId, settings } = body;
        const session = await checkAuth();

        if (!restaurantId || !settings) {
            return NextResponse.json(
                { error: "Missing restaurantId or settings" },
                { status: 400 }
            );
        }
        const isEmergency = settings?.restaurantSettings?.emergency_closure;

        if (isEmergency) {
            const today = new Date().toLocaleDateString("en-CA");

            const startDate = new Date(`${today}T00:00:00`);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            const todayReservations = await prisma.reservation.findMany({
                where: {
                    restaurant_id: restaurantId,
                    arrival_time: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
            });

            const baseUrl =
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

            Promise.all(
                todayReservations.map(async (reservation) => {
                    const res = await fetch(`${baseUrl}/api/reservations/update`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-internal-key": process.env.INTERNAL_API_KEY!,
                        },
                        body: JSON.stringify({
                            reservationId: reservation.id,
                            user_id: session?.user?.id,
                            status: "CANCELLED",
                        }),
                    });

                    const data = await res.json();

                    return data;
                })
            );

        }

        const result = await prisma.reservationSettings.upsert({
            where: { restaurant_id: restaurantId },
            create: {
                settings,
                restaurant: { connect: { id: restaurantId } },
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
