import prisma from "@/lib/prisma";
import { ReservationCounts } from "@/lib/types";
import { type NextRequest, NextResponse } from "next/server";

function isValidDate(d: unknown): d is Date {
    return d instanceof Date && !isNaN(d.getTime());
}


interface QueryResult {
    pending_reservations: bigint;
    cancelled_reservations: bigint;
    completed_reservations: bigint;
    confirmed_reservations: bigint;
    no_show_reservations: bigint;
    seated_reservations: bigint;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const restaurantId = searchParams.get("restaurantId");
        const date = searchParams.get("date");

        if (!restaurantId) {
            return NextResponse.json(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            );
        }

        // Build WHERE conditions with proper type casting
        const conditions: string[] = [`restaurant_id = $1::uuid`];
        const params: (string | Date)[] = [restaurantId];

        // Validate date before use
        if (date) {
            const targetDate = new Date(date);
            if (!isValidDate(targetDate)) {
                return NextResponse.json(
                    { success: false, error: "Invalid date format" },
                    { status: 400 },
                );
            }

            const nextDate = new Date(targetDate);
            nextDate.setDate(nextDate.getDate() + 1);

            conditions.push(`arrival_time >= $2::timestamp`, `arrival_time < $3::timestamp`);
            params.push(targetDate, nextDate);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Single SQL query to get all counts at once
        const sqlQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_reservations,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_reservations,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_reservations,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status = 'NO_SHOW' THEN 1 END) as no_show_reservations,
        COUNT(CASE WHEN status = 'SEATED' THEN 1 END) as seated_reservations
      FROM reservations
      ${whereClause}
    `;

        // Execute raw query with proper typing
        const result = await prisma.$queryRawUnsafe<QueryResult[]>(sqlQuery, ...params);
        const data = result[0];

        if (!data) {
            return NextResponse.json({
                success: true,
                data: {
                    status_breakdown: {
                        pending_reservations: 0,
                        cancelled_reservations: 0,
                        completed_reservations: 0,
                        confirmed_reservations: 0,
                        no_show_reservations: 0,
                        seated_reservations: 0,
                    }
                }
            });
        }

        const statusBreakdown: ReservationCounts = {
            pending_reservations: Number(data.pending_reservations),
            cancelled_reservations: Number(data.cancelled_reservations),
            completed_reservations: Number(data.completed_reservations),
            confirmed_reservations: Number(data.confirmed_reservations),
            no_show_reservations: Number(data.no_show_reservations),
            seated_reservations: Number(data.seated_reservations),
        };

        return NextResponse.json({
            success: true,
            data: {
                status_breakdown: statusBreakdown
            }
        });
    } catch (error) {
        console.error("[Reservations GET]", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch reservations" },
            { status: 500 },
        );
    }
}