import { DynamicRule, SettingsState } from '@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types';
import { CapacityService } from '@/lib/capacity-service';
import { extractSendGridFromSettings, getRenderedReservationEmailTemplates } from '@/lib/email-utils';
import prisma from "@/lib/prisma";
import { sendEmailWithSendGridUsingKey } from '@/lib/send-grid';
import type { ReservationsListResponse } from "@/lib/types";
import { getEstimatedDuration, textToSimpleHtml } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from "next/server";
import { after } from "next/server";

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
        const cookieStore = await cookies();
        const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
        const t = await getTranslations({ locale, namespace: 'reservations_api' });

        const body: CreateReservationRequest = await request.json();

        const validationError = await validateReservationRequest(body, locale);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const result: any = await createReservationWithValidation(body, locale);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            reservation: result.reservation,
            deposit: result.deposit,
            message: t('success.reservation_created')
        });

    } catch {
        const cookieStore = await cookies();
        const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
        const t = await getTranslations({ locale, namespace: 'reservations_api.errors' });
        return NextResponse.json(
            { error: t('failed_create_reservation') },
            { status: 500 }
        );
    }
}

async function validateReservationRequest(body: CreateReservationRequest, locale: string = 'en'): Promise<string | null> {
    const t = await getTranslations({ locale, namespace: 'reservations_api.errors' });
    if (!body.restaurantId) return t('restaurant_id_required');
    if (!body.customer_name?.trim()) return t('customer_name_required');
    if (!body.customer_email?.trim()) return t('customer_email_required');
    if (!body.arrival_time) return t('arrival_time_required');
    if (!body.party_size || body.party_size < 1) return t('valid_party_size_required');
    if (!body.payment_method) return t('payment_method_required');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customer_email)) {
        return t('invalid_email_format');
    }

    // Validate arrival time is in the future
    const arrivalTime = new Date(body.arrival_time);
    if (arrivalTime <= new Date()) {
        return t('arrival_time_future');
    }

    return null;
}

async function createReservationWithValidation(data: CreateReservationRequest, locale: string = 'en') {
    const t = await getTranslations({ locale, namespace: 'reservations_api.errors' });
    const capacityService = new CapacityService();
    const arrivalTime = new Date(data.arrival_time);

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
        return { success: false, error: t('restaurant_not_found') };
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
                t('restaurant_temporarily_closed')
        };
    }

    // ⛔ Paused reservations → block (only if not emergency)
    if (pause_new_reservations) {
        return {
            success: false,
            error: custom_message_for_customers ||
                t('restaurant_not_accepting')
        };
    }


    const estimatedDuration = getEstimatedDuration(settings, data.party_size);

    // Check opening hours
    const openingHoursCheck = await checkOpeningHours(restaurant, arrivalTime, locale);
    if (!openingHoursCheck.isOpen) {
        return { success: false, error: openingHoursCheck.error };
    }

    // Check time overrides
    const overrideCheck = await checkTimeOverrides(restaurant, arrivalTime, locale);
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
            error: t('not_enough_capacity', { availableCapacity: capacityCheck.availableCapacity })
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
            error: t('no_suitable_tables')
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

        const extracted = extractSendGridFromSettings(settings);

        if (extracted.ok) {
            const vars = {
                restaurant_name: restaurant.name ?? "",
                guest_name: reservation.customer_name ?? "",
                party_size: data.party_size,
                date: reservation.arrival_time.toLocaleDateString("en-GB"),
                time: reservation.arrival_time.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
                restaurant_contact: restaurant.phone ?? "",
            };

            const { apiKey, fromEmail, fromName } = extracted.config;
            const renderedTemplates = getRenderedReservationEmailTemplates(settings, vars);

            // schedule background work (won’t block response)
            after(async () => {
                try {
                    const tasks: Promise<any>[] = [];

                    // send to customer (only if enabled)
                    if (extracted.email_confirmation_enabled) {
                        const t = renderedTemplates.find((x) => x.type === "confirmation");
                        if (t && reservation.customer_email) {
                            const subject = t.rendered_subject || t.type;
                            const text = t.rendered_body || "";
                            const html = textToSimpleHtml(text);

                            tasks.push(
                                sendEmailWithSendGridUsingKey({
                                    apiKey,
                                    to: reservation.customer_email,
                                    fromEmail,
                                    fromName,
                                    replyTo: fromEmail,
                                    subject,
                                    html,
                                    text,
                                })
                            );
                        }
                    }

                    // send to owner(s)
                    const shouldNotifyOwner =
                        extracted.owner_notifications_enabled &&
                        extracted.owner_notify_new_bookings &&
                        extracted.owner_emails.length > 0;

                    if (shouldNotifyOwner) {
                        const ownerSubject = `New reservation: ${vars.guest_name} (${vars.party_size}) - ${vars.date} ${vars.time}`;
                        const ownerText =
                            `New reservation received.\n\n` +
                            `Restaurant: ${vars.restaurant_name}\n` +
                            `Guest: ${vars.guest_name}\n` +
                            `Party size: ${vars.party_size}\n` +
                            `Date: ${vars.date}\n` +
                            `Time: ${vars.time}\n` +
                            `Contact: ${reservation.customer_email}\n`;

                        const ownerHtml = textToSimpleHtml(ownerText);

                        for (const ownerEmail of extracted.owner_emails) {
                            tasks.push(
                                sendEmailWithSendGridUsingKey({
                                    apiKey,
                                    to: ownerEmail,
                                    fromEmail,
                                    fromName,
                                    replyTo: fromEmail,
                                    subject: ownerSubject,
                                    html: ownerHtml,
                                    text: ownerText,
                                })
                            );
                        }
                    }

                    await Promise.allSettled(tasks);
                } catch (e) {
                    console.log(e);
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

async function checkOpeningHours(restaurant: any, arrivalTime: Date, locale: string = 'en') {
    const t = await getTranslations({ locale, namespace: 'reservations_api.errors' });
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
            error: t('restaurant_closed_date')
        };
    }

    // Parse opening and closing times in restaurant's timezone
    const openTime = parseTime(daySchedule.open);
    const closeTime = parseTime(daySchedule.close);

    if (!openTime || !closeTime) {
        return {
            isOpen: false,
            error: t('invalid_opening_hours')
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
            error: t('restaurant_open_hours', { open: daySchedule.open, close: daySchedule.close, dayName })
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
async function checkTimeOverrides(restaurant: any, arrivalTime: Date, locale: string = 'en') {
    const t = await getTranslations({ locale, namespace: 'reservations_api.errors' });
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
                const reason = override.reason || t('scheduled_maintenance');
                return {
                    isBlocked: true,
                    error: t('time_slot_blocked', { reason })
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