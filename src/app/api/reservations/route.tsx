import { DynamicRule, SettingsState } from '@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types';
import { CapacityService } from '@/lib/capacity-service';
import prisma from "@/lib/prisma";
import type { ReservationsListResponse } from "@/lib/types";
import { getEstimatedDuration } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const restaurantId = searchParams.get("restaurantId");
        const date = searchParams.get("date");
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!restaurantId) {
            return NextResponse.json<ReservationsListResponse>(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            );
        }

        // Build the where clause for date filtering
        const whereClause: Prisma.ReservationWhereInput = {
            restaurant_id: restaurantId,
        };

        // If single date is provided
        if (date && !from && !to) {
            const targetDate = new Date(date);
            const nextDate = new Date(targetDate);
            nextDate.setDate(nextDate.getDate() + 1);

            whereClause.arrival_time = {
                gte: targetDate,
                lt: nextDate,
            };
        }
        // If date range is provided
        else if (from && to) {
            const startDate = new Date(from);
            const endDate = new Date(to);
            endDate.setDate(endDate.getDate() + 1); // Include the entire end date

            whereClause.arrival_time = {
                gte: startDate,
                lt: endDate,
            };
        }
        // If only one of from/to is provided (invalid case)
        else if ((from && !to) || (!from && to)) {
            return NextResponse.json<ReservationsListResponse>(
                { success: false, error: "Both 'from' and 'to' dates are required for date range" },
                { status: 400 },
            );
        }
        // If no date filters, return all reservations for the restaurant

        const reservations = await prisma.reservation.findMany({
            where: whereClause,
            include: {
                payment: true,
                table_reservations: {
                    include: {
                        table: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json<ReservationsListResponse>({
            success: true,
            data: reservations,
        });
    } catch (error) {
        console.error("[Reservations GET]", error);
        return NextResponse.json<ReservationsListResponse>(
            { success: false, error: "Failed to fetch reservations" },
            { status: 500 },
        );
    }
}


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
}

export async function POST(request: NextRequest) {
    try {

        const body: CreateReservationRequest = await request.json();

        const validationError = validateReservationRequest(body);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const result: any = await createReservationWithValidation(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            reservation: result.reservation,
            deposit: result.deposit,
            message: 'Reservation created successfully'
        });

    } catch {
        return NextResponse.json(
            { error: 'Failed to create reservation' },
            { status: 500 }
        );
    }
}

function validateReservationRequest(body: CreateReservationRequest): string | null {
    if (!body.restaurantId) return 'Restaurant ID is required';
    if (!body.customer_name?.trim()) return 'Customer name is required';
    if (!body.customer_email?.trim()) return 'Customer email is required';
    if (!body.arrival_time) return 'Arrival time is required';
    if (!body.party_size || body.party_size < 1) return 'Valid party size is required';
    if (!body.payment_method) return 'Payment method is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customer_email)) {
        return 'Invalid email format';
    }

    // Validate arrival time is in the future
    const arrivalTime = new Date(body.arrival_time);
    if (arrivalTime <= new Date()) {
        return 'Arrival time must be in the future';
    }

    return null;
}

async function createReservationWithValidation(data: CreateReservationRequest) {
    const capacityService = new CapacityService();
    const arrivalTime = new Date(data.arrival_time);

    console.log('Arrival time:', arrivalTime);

    // Get restaurant and settings
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: data.restaurantId },
        include: {
            reservation_settings: true,
            tables: {
                where: { status: 'ACTIVE' },
                include: { area: true }
            }
        }
    });

    if (!restaurant) {
        return { success: false, error: 'Restaurant not found' };
    }

    const settings = restaurant?.reservation_settings?.settings as SettingsState | undefined;

    const {
        pause_new_reservations,
        emergency_closure,
        custom_message_for_customers
    } = settings?.restaurantSettings || {};

    // ⛔ Emergency closure → block immediately
    if (emergency_closure) {
        return {
            success: false,
            error: custom_message_for_customers ||
                "The restaurant is temporarily closed and cannot accept reservations."
        };
    }

    // ⛔ Paused reservations → block (only if not emergency)
    if (pause_new_reservations) {
        return {
            success: false,
            error: custom_message_for_customers ||
                "The restaurant is currently not accepting new reservations."
        };
    }


    const estimatedDuration = getEstimatedDuration(settings, data.party_size);

    // Check opening hours
    const openingHoursCheck = await checkOpeningHours(restaurant, arrivalTime);
    if (!openingHoursCheck.isOpen) {
        return { success: false, error: openingHoursCheck.error };
    }

    // Check time overrides
    const overrideCheck = await checkTimeOverrides(restaurant, arrivalTime);
    if (overrideCheck.isBlocked) {
        return { success: false, error: overrideCheck.error };
    }

    // Check capacity
    const capacityCheck = await capacityService.checkCapacity(
        data.restaurantId,
        arrivalTime,
        estimatedDuration,
        data.party_size
    );

    if (!capacityCheck.available) {
        return {
            success: false,
            error: `Not enough capacity. Only ${capacityCheck.availableCapacity} seats available for this time.`
        };
    }

    // Get restaurant settings
    const enableTableCombinations = settings?.restaurantSettings?.enable_table_combinations || false;


    // Find available table(s)
    let assignedTables: any = [];
    let bestTable = null;
    let tableCombination = null;

    // First try to find a single table
    bestTable = await capacityService.findBestTable(
        data.restaurantId,
        arrivalTime,
        estimatedDuration,
        data.party_size,
        data.preferred_area
    );

    if (!bestTable && enableTableCombinations) {

        let combinations = await capacityService.findTableCombinationsOptimized(
            data.restaurantId,
            data.party_size,
            arrivalTime,
            estimatedDuration,
            20 // Get more combinations to find the optimal one
        );

        if (combinations.length === 0) {
            combinations = await capacityService.findTableCombinationsDebug(
                data.restaurantId,
                data.party_size,
                arrivalTime,
                estimatedDuration
            );
        }

        if (combinations.length > 0) {
            // Select the first combination (already optimized for minimum wasted capacity)
            tableCombination = combinations[0];
            assignedTables = tableCombination.tables;
        }
    } else if (bestTable) {
        assignedTables = [bestTable];
    }

    // If still no tables available (single or combination)
    if (assignedTables.length === 0) {
        return {
            success: false,
            error: 'No suitable tables available for the selected time and party size.'
        };
    }

    // Calculate deposit on server side
    const depositCalculation = calculateDepositOnServer(settings, arrivalTime, data.party_size, restaurant.timezone || "'Europe/London'");
    const depositAmount = depositCalculation.amount;
    const appliedRule = depositCalculation.appliedRule;

    // Create reservation with transaction
    return await prisma.$transaction(async (tx) => {
        // Create the reservation
        const reservation = await tx.reservation.create({
            data: {
                restaurant_id: data.restaurantId,
                customer_name: data.customer_name.trim(),
                customer_email: data.customer_email.trim(),
                customer_phone: data.customer_phone?.trim(),
                arrival_time: arrivalTime,
                estimated_duration_minutes: estimatedDuration,
                party_size: data.party_size,
                special_requests: data.special_requests?.trim(),
                preferred_area: data.preferred_area,
                status: 'CONFIRMED',
                source: 'ONLINE'
            }
        });

        // Assign table(s) to reservation
        for (const table of assignedTables) {
            await tx.tableReservation.create({
                data: {
                    reservation_id: reservation.id,
                    table_id: table.id,
                    assigned_by: 'System'
                }
            });
        }

        // Create payment record if deposit is required
        if (depositAmount > 0) {
            await tx.payment.create({
                data: {
                    reservation_id: reservation.id,
                    amount: depositAmount,
                    payment_method: data.payment_method,
                    status: 'PAID',
                    deposit_amount: depositAmount,
                    paid_at: new Date(),
                }
            });
        }

        return {
            success: true,
            reservation: {
                id: reservation.id,
                customer_name: reservation.customer_name,
                arrival_time: reservation.arrival_time,
                party_size: reservation.party_size,
                tables: assignedTables,
                isTableCombination: tableCombination !== null
            },
            deposit: {
                amount: depositAmount,
                applied_rule: appliedRule
            }
        };
    });
}

// Server-side deposit calculation (same logic as frontend but on server)
function calculateDepositOnServer(
    settings: any,
    arrivalTime: Date,
    partySize: number,
    timezone: string
): { amount: number; appliedRule?: DynamicRule } {

    if (!settings?.deposit_settings?.depositSystemEnabled) {
        return { amount: 0 };
    }

    const baseDepositAmount = parseFloat(settings.deposit_settings.depositAmount || '0');
    const dynamicRules = settings.deposit_settings.dynamicRules || [];

    // Filter applicable rules based on current selection
    const applicableRules: DynamicRule[] = [];

    dynamicRules.forEach((rule: DynamicRule) => {
        let isApplicable = false;

        switch (rule.ruleType) {
            case 'special-date':
                if (rule.date) {
                    const ruleDate = new Date(rule.date);
                    isApplicable = ruleDate.toDateString() === arrivalTime.toDateString();
                }
                break;

            // In calculateDepositOnServer function, update time-based rules:
            case 'time-slot':
                if (rule.startTime && rule.endTime) {
                    const restaurantTimezone = timezone || 'Europe/London';
                    const arrivalTimeInRestaurantTZ = new Date(
                        arrivalTime.toLocaleString("en-US", { timeZone: restaurantTimezone })
                    );

                    const arrivalMinutes = timeToMinutes(
                        arrivalTimeInRestaurantTZ.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })
                    );

                    const startMinutes = timeToMinutes(rule.startTime);
                    const endMinutes = timeToMinutes(rule.endTime);

                    isApplicable = arrivalMinutes >= startMinutes && arrivalMinutes <= endMinutes;
                }
                break;

            case 'party-size':
                if (rule.minPartySize && rule.maxPartySize) {
                    const min = parseInt(rule.minPartySize);
                    const max = parseInt(rule.maxPartySize);
                    isApplicable = partySize >= min && partySize <= max;
                }
                break;

            case 'day-of-week':
                if (rule.days) {
                    const dayOfWeek = arrivalTime.getDay(); // 0 = Sunday, 6 = Saturday
                    const ruleDays = rule.days.split(',').map(d => parseInt(d.trim()));
                    isApplicable = ruleDays.includes(dayOfWeek);
                }
                break;
        }

        if (isApplicable) {
            applicableRules.push(rule);
        }
    });

    // Sort by priority (highest first) and pick the highest priority rule
    applicableRules.sort((a, b) => parseInt(b.priority) - parseInt(a.priority));

    let finalAmount = 0;
    let appliedRule: DynamicRule | undefined;

    if (applicableRules.length > 0) {
        // Use the highest priority rule
        appliedRule = applicableRules[0];
        const ruleAmount = parseFloat(appliedRule.amount || '0');

        if (appliedRule.depositType === 'per-person') {
            finalAmount = ruleAmount * partySize;
        } else {
            finalAmount = ruleAmount;
        }
    } else {
        // Use base deposit settings
        if (settings.deposit_settings.depositType === 'per-person') {
            finalAmount = baseDepositAmount * partySize;
        } else {
            finalAmount = baseDepositAmount;
        }
    }

    return { amount: finalAmount, appliedRule };
}

async function checkOpeningHours(restaurant: any, arrivalTime: Date) {
    const openingHours = restaurant.opening_hours || {};
    const restaurantTimezone = restaurant.timezone || 'Europe/London';

    // Convert arrival time to restaurant's timezone
    const arrivalTimeInRestaurantTZ = new Date(
        arrivalTime.toLocaleString("en-US", { timeZone: restaurantTimezone })
    );

    const dayName = getDayName(arrivalTimeInRestaurantTZ);
    const daySchedule = openingHours[dayName];

    if (!daySchedule || daySchedule.closed) {
        return {
            isOpen: false,
            error: 'Restaurant is closed on the selected date.'
        };
    }

    // Parse opening and closing times in restaurant's timezone
    const openTime = parseTime(daySchedule.open);
    const closeTime = parseTime(daySchedule.close);

    if (!openTime || !closeTime) {
        return {
            isOpen: false,
            error: 'Invalid opening hours configuration.'
        };
    }

    // Create date objects in restaurant's timezone for comparison
    const arrivalDate = new Date(arrivalTimeInRestaurantTZ);
    const openDateTime = new Date(arrivalDate);
    openDateTime.setHours(openTime.hours, openTime.minutes, 0, 0);

    const closeDateTime = new Date(arrivalDate);
    closeDateTime.setHours(closeTime.hours, closeTime.minutes, 0, 0);

    // Check if arrival time is within opening hours in restaurant's timezone
    if (arrivalTimeInRestaurantTZ < openDateTime || arrivalTimeInRestaurantTZ > closeDateTime) {
        return {
            isOpen: false,
            error: `Restaurant is open from ${daySchedule.open} to ${daySchedule.close} on ${dayName}.`
        };
    }

    return { isOpen: true };
}

// Update the getDayName function to be more reliable
function getDayName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
}

// Update checkTimeOverrides function to use restaurant timezone
async function checkTimeOverrides(restaurant: any, arrivalTime: Date) {
    const settings = restaurant.reservation_settings?.settings as any;
    const overridesSettings = settings?.overrides_settings || {
        overrides_enabled: false,
        overrides: []
    };

    if (!overridesSettings.overrides_enabled) {
        return { isBlocked: false };
    }

    const restaurantTimezone = restaurant.timezone || 'Europe/London';

    // Convert arrival time to restaurant's timezone for date comparison
    const arrivalTimeInRestaurantTZ = new Date(
        arrivalTime.toLocaleString("en-US", { timeZone: restaurantTimezone })
    );

    const arrivalDateStr = arrivalTimeInRestaurantTZ.toISOString().split('T')[0];

    // Use the original arrival time for minute calculation (time is absolute)
    const arrivalMinutes = timeToMinutes(
        arrivalTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    );

    for (const override of overridesSettings.overrides) {
        if (override.date === arrivalDateStr && override.blocked) {
            const startMinutes = timeToMinutes(override.startTime);
            const endMinutes = timeToMinutes(override.endTime);

            if (arrivalMinutes >= startMinutes && arrivalMinutes <= endMinutes) {
                return {
                    isBlocked: true,
                    error: `Time slot is blocked due to: ${override.reason || 'Scheduled maintenance'}`
                };
            }
        }
    }

    return { isBlocked: false };
}

function parseTime(timeStr: string): { hours: number; minutes: number } | null {
    if (!timeStr) return null;

    try {
        const [time, period] = timeStr.split(' ');
        const [hoursStr, minutesStr] = time.split(':');

        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return { hours, minutes };
    } catch {
        return null;
    }
}

function timeToMinutes(timeStr: string): number {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours % 12 * 60 + minutes;
    if (period === 'PM') totalMinutes += 12 * 60;
    return totalMinutes;
}


export async function DELETE(request: NextRequest) {
    try {
        const reservationId = request.nextUrl.searchParams.get("id");

        if (!reservationId) {
            return NextResponse.json(
                { success: false, error: "Reservation ID is required" },
                { status: 400 }
            );
        }

        // Delete the main reservation
        await prisma.reservation.delete({
            where: { id: reservationId },
        });

        return NextResponse.json({
            success: true,
            message: "Reservation deleted successfully",
        });
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to delete reservation" },
            { status: 500 }
        );
    }
}