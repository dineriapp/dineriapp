import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CapacityService } from "@/lib/capacity-service";
import { getEstimatedDuration } from "@/lib/utils";
import { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const restaurantId = searchParams.get("restaurantId");
        const date = searchParams.get("date");

        if (!restaurantId || !date) {
            return NextResponse.json(
                { success: false, error: "restaurantId and date are required" },
                { status: 400 }
            );
        }

        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return NextResponse.json(
                { success: false, error: "Invalid date format" },
                { status: 400 }
            );
        }

        // === STEP 1: Fetch restaurant + settings ===
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                reservation_settings: true,
                tables: { select: { capacity: true } }
            }
        });

        if (!restaurant) {
            return NextResponse.json(
                { success: false, error: "Restaurant not found" },
                { status: 404 }
            );
        }

        const settings = restaurant?.reservation_settings?.settings as SettingsState | undefined;
        const restaurantTimezone = restaurant.timezone || "Europe/London";

        // === Timeslots ALWAYS 30 minutes ===
        const intervalMinutes = 30;

        // === Max capacity (sum of tables) ===
        const capacityService = new CapacityService();
        const maxCapacity = await capacityService.calculateTotalCapacity(restaurantId);

        // === Build day boundaries in restaurant’s timezone ===
        const dayStart = convertToRestaurantTZ(targetDate, restaurantTimezone);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        // === Fetch all relevant reservations ===
        const reservations = await prisma.reservation.findMany({
            where: {
                restaurant_id: restaurantId,
                status: { in: ["PENDING", "CONFIRMED", "SEATED"] }
            },
            select: {
                party_size: true,
                arrival_time: true,
                estimated_duration_minutes: true
            }
        });

        // === Normalize reservations (apply correct duration) ===
        const normalized = reservations.map((r) => {
            const startUTC = new Date(r.arrival_time);

            const start = convertToRestaurantTZ(startUTC, restaurantTimezone);

            const duration =
                r.estimated_duration_minutes ||
                getEstimatedDuration(settings, r.party_size);

            const end = new Date(start.getTime() + duration * 60000);

            return {
                start,
                end,
                party_size: r.party_size
            };
        });

        function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }) {
            return a.start < b.end && a.end > b.start;
        }

        const slots = [];

        // === Build 30-minute slots for full 24 hours ===
        for (let m = 0; m < 1440; m += intervalMinutes) {
            const slotStart = new Date(dayStart.getTime() + m * 60000);
            const slotEnd = new Date(slotStart.getTime() + intervalMinutes * 60000);

            let currentCapacity = 0;

            for (const r of normalized) {
                if (overlaps({ start: slotStart, end: slotEnd }, r)) {
                    currentCapacity += r.party_size;
                }
            }

            slots.push({
                time: slotStart.toISOString(),
                label: slotStart.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }),
                current_capacity: currentCapacity,
                available_capacity: Math.max(0, maxCapacity - currentCapacity),
                max_capacity: maxCapacity
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                restaurant_id: restaurantId,
                date,
                interval_minutes: 30, // ALWAYS 30 min
                slots
            }
        });

    } catch (error) {
        console.error("[Day Capacity API Error]", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch capacity" },
            { status: 500 }
        );
    }
}

// Convert UTC → Restaurant timezone correctly
function convertToRestaurantTZ(date: Date, timezone: string) {
    const str = date.toLocaleString("en-US", { timeZone: timezone });
    return new Date(str);
}
