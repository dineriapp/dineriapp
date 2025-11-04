import { CapacityService } from '@/lib/capacity-service';
import prisma from "@/lib/prisma";
import { ReservationService } from "@/lib/reservation-service";
import type { ReservationsListResponse } from "@/lib/types";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/reservations?restaurantId=xxx
export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurantId")

        if (!restaurantId) {
            return NextResponse.json<ReservationsListResponse>(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            )
        }

        const reservations = await prisma.reservation.findMany({
            where: {
                // Filter by restaurant through tableLinks if needed, or add restaurant_id to Reservation model
            },
            include: {
                payment: true,
                table_reservations: {
                    include: {
                        table: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json<ReservationsListResponse>({
            success: true,
            data: reservations,
        })
    } catch (error) {
        console.error("[Reservations GET]", error)
        return NextResponse.json<ReservationsListResponse>(
            { success: false, error: "Failed to fetch reservations" },
            { status: 500 },
        )
    }
}


// Types for the request
interface CreateReservationRequest {
    restaurantId: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    arrival_time: string; // ISO string
    party_size: number;
    special_requests?: string;
    preferred_area?: string;
    payment_method: 'card' | 'cash';
    payment_intent_id?: string; // For Stripe payments
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateReservationRequest = await request.json();

        // Validate required fields
        const requiredFields = ['restaurantId', 'customer_name', 'customer_email', 'arrival_time', 'party_size', 'payment_method'];
        const missingFields = requiredFields.filter(
            field => !(body as Record<string, any>)[field]
        );

        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate payment method
        if (!['card', 'cash'].includes(body.payment_method)) {
            return NextResponse.json(
                { success: false, error: 'Invalid payment method' },
                { status: 400 }
            );
        }

        // Validate party size
        if (body.party_size < 1) {
            return NextResponse.json(
                { success: false, error: 'Party size must be at least 1' },
                { status: 400 }
            );
        }

        // Validate arrival time
        const arrivalTime = new Date(body.arrival_time);
        if (isNaN(arrivalTime.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid arrival time format' },
                { status: 400 }
            );
        }

        // Check if arrival time is in the future
        if (arrivalTime <= new Date()) {
            return NextResponse.json(
                { success: false, error: 'Arrival time must be in the future' },
                { status: 400 }
            );
        }

        // Get restaurant with opening_hours and settings
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: body.restaurantId },
            include: {
                reservation_settings: true
            }
        });

        if (!restaurant) {
            return NextResponse.json(
                { success: false, error: 'Restaurant not found' },
                { status: 404 }
            );
        }

        if (!restaurant.reservation_settings) {
            return NextResponse.json(
                { success: false, error: 'Restaurant reservation settings not configured' },
                { status: 400 }
            );
        }

        const settings = restaurant.reservation_settings.settings as any;
        const openingHours = restaurant.opening_hours as any;

        // Initialize services with correct data
        const reservationService = new ReservationService(body.restaurantId, settings, openingHours);
        const capacityService = new CapacityService();

        // 1. Check if restaurant is open at requested time
        const restaurantOpenCheck = reservationService.isRestaurantOpen(arrivalTime);
        if (!restaurantOpenCheck.isOpen) {
            return NextResponse.json(
                { success: false, error: restaurantOpenCheck.reason },
                { status: 400 }
            );
        }

        // 2. Check if time slot is available (overrides)
        const timeSlotCheck = reservationService.isTimeSlotAvailable(arrivalTime);
        if (!timeSlotCheck.available) {
            return NextResponse.json(
                { success: false, error: timeSlotCheck.reason },
                { status: 400 }
            );
        }

        // 3. Calculate estimated duration
        const estimatedDuration = reservationService.calculateEstimatedDuration(body.party_size);

        // 4. Check capacity
        const capacityCheck = await capacityService.checkCapacity(
            body.restaurantId,
            arrivalTime,
            estimatedDuration,
            body.party_size
        );

        if (!capacityCheck.available) {
            return NextResponse.json(
                {
                    success: false,
                    error: `No capacity available. Current: ${capacityCheck.currentCapacity}/${capacityCheck.maxCapacity}`,
                    availableCapacity: capacityCheck.availableCapacity
                },
                { status: 400 }
            );
        }

        // 5. Find available tables
        const availableTables = await capacityService.findAvailableTables(
            body.restaurantId,
            arrivalTime,
            estimatedDuration,
            body.party_size,
            body.preferred_area
        );

        if (availableTables.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No suitable tables available for the requested time' },
                { status: 400 }
            );
        }

        // 6. Calculate deposit
        const depositAmount = reservationService.calculateDepositAmount(body.party_size, arrivalTime);

        // 7. Create reservation
        const result = await prisma.$transaction(async (tx) => {
            // Create reservation
            const reservation = await tx.reservation.create({
                data: {
                    restaurant_id: body.restaurantId,
                    customer_name: body.customer_name,
                    customer_email: body.customer_email,
                    customer_phone: body.customer_phone,
                    arrival_time: arrivalTime,
                    estimated_duration_minutes: estimatedDuration,
                    party_size: body.party_size,
                    special_requests: body.special_requests,
                    preferred_area: body.preferred_area,
                    status: 'PENDING',
                    source: 'ONLINE'
                }
            });

            // Assign table
            const assignedTable = availableTables[0]; // Best fit table
            await tx.tableReservation.create({
                data: {
                    reservation_id: reservation.id,
                    table_id: assignedTable.id,
                    assigned_at: new Date()
                }
            });

            // Determine payment status based on method and deposit
            let paymentStatus: 'PENDING' | 'PAID' = 'PENDING';
            let paidAt: Date | null = null;

            if (body.payment_method === 'cash') {
                // Cash payments are considered PAID immediately
                paymentStatus = 'PAID';
                paidAt = new Date();
            } else if (body.payment_method === 'card' && depositAmount === 0) {
                // Card payments with no deposit are considered PAID
                paymentStatus = 'PAID';
                paidAt = new Date();
            }
            // Card payments with deposit remain PENDING until payment intent is confirmed

            // Create payment record
            const payment = await tx.payment.create({
                data: {
                    reservation_id: reservation.id,
                    amount: depositAmount,
                    currency: settings.deposit_settings?.depositCurrency || 'EUR',
                    payment_method: body.payment_method, // Store method separately
                    transaction_id: body.payment_intent_id,
                    status: paymentStatus, // Status without CASH
                    deposit_amount: depositAmount,
                    deposit_percentage: depositAmount > 0 ? 100 : null,
                    paid_at: paidAt
                }
            });

            return {
                reservation,
                payment,
                assigned_table: assignedTable,
                estimated_duration: estimatedDuration,
                deposit_amount: depositAmount
            };
        });

        // 8. Send confirmation email if enabled
        if (settings.notification_settings?.email_confirmation_enabled) {
            await sendConfirmationEmail(result.reservation, settings.notification_settings, restaurant);
        }

        return NextResponse.json({
            success: true,
            reservation: result.reservation,
            payment: result.payment,
            assigned_table: result.assigned_table,
            estimated_duration: result.estimated_duration,
            deposit_amount: result.deposit_amount
        });

    } catch (error: any) {
        console.error('Reservation creation error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to create reservation'
            },
            { status: 500 }
        );
    }
}

async function sendConfirmationEmail(reservation: any, notificationSettings: any, restaurant: any) {
    // Implement email sending using Resend, SendGrid, etc.
    console.log({ notificationSettings, restaurant })
    try {
        console.log('Sending confirmation email to:', reservation.customer_email);
        // Email implementation here...
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }
}
