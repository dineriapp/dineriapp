import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

function isValidDate(d: unknown): d is Date {
    return d instanceof Date && !isNaN(d.getTime());
}

interface QueryResult {
    confirmed_reservations: bigint;
    total_reservations: bigint;
    avg_party_size: number | null;
    total_deposit_gain: number | null;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const restaurantId = searchParams.get("restaurantId");
        const date = searchParams.get("date");

        if (!restaurantId) {
            return NextResponse.json(
                { success: false, error: "restaurantId is required" },
                { status: 400 }
            );
        }

        const conditions: string[] = [`reservations.restaurant_id = $1::uuid`];
        const params: (string | Date)[] = [restaurantId];

        if (date) {
            const targetDate = new Date(date);
            if (!isValidDate(targetDate)) {
                return NextResponse.json(
                    { success: false, error: "Invalid date format" },
                    { status: 400 }
                );
            }

            const nextDate = new Date(targetDate);
            nextDate.setDate(nextDate.getDate() + 1);

            conditions.push(
                `reservations.arrival_time >= $2::timestamp`,
                `reservations.arrival_time < $3::timestamp`
            );

            params.push(targetDate, nextDate);
        }

        const whereClause = `WHERE ${conditions.join(" AND ")}`;

        const sqlQuery = `
            SELECT
                COUNT(*) AS total_reservations,
                COUNT(CASE WHEN reservations.status = 'CONFIRMED' THEN 1 END) AS confirmed_reservations,
                AVG(reservations.party_size)::float AS avg_party_size,
                SUM(payments.deposit_amount)::float AS total_deposit_gain
            FROM reservations
            LEFT JOIN payments 
                ON payments.reservation_id = reservations.id
            ${whereClause}
        `;

        const result = await prisma.$queryRawUnsafe<QueryResult[]>(sqlQuery, ...params);
        const data = result[0];

        return NextResponse.json({
            success: true,
            data: {
                total_reservations: Number(data?.total_reservations ?? 0),
                confirmed_reservations: Number(data?.confirmed_reservations ?? 0),
                avg_party_size: data?.avg_party_size ?? 0,
                total_deposit_gain: data?.total_deposit_gain ?? 0
            }
        });

    } catch (error) {
        console.error("[Reservations GET]", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch reservations" },
            { status: 500 }
        );
    }
}
