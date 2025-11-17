import prisma from "@/lib/prisma";
import { getReservationStatus } from "@/lib/utils";
import { reservationSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = reservationSchema.parse(body);

        if (!validatedData.restaurantId) {
            return NextResponse.json(
                { error: "Restaurant selection is required" },
                { status: 400 }
            );
        }

        const reservationDate = new Date(validatedData.arival_time || "");

        const newReservation = await prisma.reservationQuery.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phoneNumber: validatedData.phoneNumber || null,
                message: validatedData.message,
                date: reservationDate,
                time: validatedData.time,
                status: getReservationStatus(reservationDate),
                restaurant_id: validatedData.restaurantId,
            },
            include: {
                restaurant: true,
            },
        });

        return NextResponse.json(newReservation, { status: 201 });
    } catch (error) {
        console.error("Reservation creation error:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create reservation" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurantId");

        if (!restaurantId) {
            return NextResponse.json(
                { error: "Restaurant ID is required" },
                { status: 400 }
            );
        }


        const reservations = await prisma.reservationQuery.findMany({
            where: {
                restaurant_id: restaurantId
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.log("Fetch reservations error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reservations" },
            { status: 500 }
        );
    }
}
