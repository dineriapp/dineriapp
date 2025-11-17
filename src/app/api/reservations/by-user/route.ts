import { DynamicRule, SettingsState } from '@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types';
import { CapacityService } from '@/lib/capacity-service';
import { decrypt_key } from '@/lib/crypto-encrypt-and-decrypt';
import prisma from "@/lib/prisma";
import { getEstimatedDuration } from '@/lib/utils';
import { type NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';

interface CreateReservationByUserRequest {
    restaurantId: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    arrival_time: string; // ISO string
    party_size: number;
    special_requests?: string;
    preferred_area?: string;
    success_url: string;
    cancel_url: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateReservationByUserRequest = await request.json();

        const validationError = validateReservationRequest(body);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        // Check Stripe configuration early
        const stripeConfigCheck = await checkStripeConfiguration(body.restaurantId);
        if (!stripeConfigCheck.valid) {
            return NextResponse.json({
                error: stripeConfigCheck.error || 'Payment system not configured'
            }, { status: 400 });
        }

        // Create reservation with pending status
        const result: any = await createPendingReservation(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // If deposit is required, create Stripe checkout session
        if (result.deposit.amount > 0) {
            const checkoutSession = await createStripeCheckoutSession(
                result.reservation,
                result.deposit,
                body.success_url,
                body.cancel_url,
                body.restaurantId
            );

            if (!checkoutSession.success) {
                // Clean up the pending reservation if Stripe session creation fails
                await cleanupFailedReservation(result.reservation.id);

                return NextResponse.json({
                    error: checkoutSession.error || 'Failed to create payment session'
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                reservation: result.reservation,
                deposit: result.deposit,
                checkout_url: checkoutSession.session.url,
                message: 'Reservation created pending payment'
            });
        } else {
            // If no deposit required, confirm reservation immediately
            await confirmReservation(result.reservation.id);

            return NextResponse.json({
                success: true,
                reservation: result.reservation,
                deposit: result.deposit,
                message: 'Reservation confirmed successfully'
            });
        }

    } catch (error) {
        console.error('Reservation creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create reservation' },
            { status: 500 }
        );
    }
}

// Check Stripe configuration before processing reservation
async function checkStripeConfiguration(restaurantId: string): Promise<{ valid: boolean; error?: string }> {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
                stripe_secret_key_encrypted: true,
                stripe_public_key_encrypted: true,
                reservation_settings: true,
                name: true
            }
        });

        if (!restaurant) {
            return { valid: false, error: 'Restaurant not found' };
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
                valid: false,
                error: custom_message_for_customers ||
                    "The restaurant is temporarily closed and cannot accept reservations."
            };
        }

        // ⛔ Paused reservations → block (only if not emergency)
        if (pause_new_reservations) {
            return {
                valid: false,
                error: custom_message_for_customers ||
                    "The restaurant is currently not accepting new reservations."
            };
        }


        // Check if Stripe keys exist
        if (!restaurant.stripe_secret_key_encrypted || !restaurant.stripe_public_key_encrypted) {
            return {
                valid: false,
                error: 'Payment system is not configured for this restaurant. Please contact the restaurant directly.'
            };
        }

        // Test decryption of Stripe secret key
        try {
            const decryptedSecretKey = decrypt_key(restaurant.stripe_secret_key_encrypted);
            if (!decryptedSecretKey || !decryptedSecretKey.startsWith('sk_')) {
                return {
                    valid: false,
                    error: 'Invalid payment configuration. Please contact the restaurant.'
                };
            }
        } catch (decryptError) {
            console.error('Stripe key decryption error:', decryptError);
            return {
                valid: false,
                error: 'Payment system configuration error. Please contact the restaurant.'
            };
        }

        return { valid: true };
    } catch (error) {
        console.error('Stripe configuration check error:', error);
        return {
            valid: false,
            error: 'Unable to verify payment system. Please try again later.'
        };
    }
}

function validateReservationRequest(body: CreateReservationByUserRequest): string | null {
    if (!body.restaurantId) return 'Restaurant ID is required';
    if (!body.customer_name?.trim()) return 'Customer name is required';
    if (!body.customer_email?.trim()) return 'Customer email is required';
    if (!body.arrival_time) return 'Arrival time is required';
    if (!body.party_size || body.party_size < 1) return 'Valid party size is required';
    if (!body.success_url) return 'Success URL is required';
    if (!body.cancel_url) return 'Cancel URL is required';

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

async function createPendingReservation(data: CreateReservationByUserRequest) {
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
            20
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
            tableCombination = combinations[0];
            assignedTables = tableCombination.tables;
        }
    } else if (bestTable) {
        assignedTables = [bestTable];
    }

    // If still no tables available
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
        // Create the reservation with PENDING status
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
                status: depositAmount > 0 ? 'PENDING' : 'CONFIRMED', // Only confirm if no deposit
                source: 'ONLINE'
            }
        });

        // Assign table(s) to reservation (temporarily hold them)
        for (const table of assignedTables) {
            await tx.tableReservation.create({
                data: {
                    reservation_id: reservation.id,
                    table_id: table.id,
                    assigned_by: 'System'
                }
            });
        }

        // Create payment record with PENDING status if deposit is required
        let payment = null;
        if (depositAmount > 0) {
            payment = await tx.payment.create({
                data: {
                    reservation_id: reservation.id,
                    amount: depositAmount,
                    payment_method: 'card', // Always card for this endpoint
                    status: 'PENDING',
                    deposit_amount: depositAmount,
                    paid_at: null, // Will be set when payment is successful
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
                isTableCombination: tableCombination !== null,
                status: reservation.status
            },
            deposit: {
                amount: depositAmount,
                applied_rule: appliedRule
            },
            payment
        };
    });
}

async function createStripeCheckoutSession(
    reservation: any,
    deposit: any,
    successUrl: string,
    cancelUrl: string,
    restaurantId: string
): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
        // Get restaurant for metadata
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
                name: true,
                stripe_secret_key_encrypted: true,
                stripe_public_key_encrypted: true
            }
        });

        if (!restaurant) {
            return { success: false, error: 'Restaurant not found' };
        }

        if (!restaurant.stripe_secret_key_encrypted) {
            return { success: false, error: "Stripe keys are not configured!" };
        }

        const stripeSecretKey = decrypt_key(restaurant.stripe_secret_key_encrypted);

        // Validate the decrypted key
        if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
            return { success: false, error: "Invalid Stripe secret key configuration" };
        }

        const stripeClient = new Stripe(stripeSecretKey, {
            apiVersion: "2025-07-30.basil",
        });

        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur', // You can make this dynamic based on settings
                        product_data: {
                            name: `Reservation Deposit - ${restaurant?.name || 'Restaurant'}`,
                            description: `Reservation for ${reservation.customer_name} on ${new Date(reservation.arrival_time).toLocaleDateString()}`
                        },
                        unit_amount: Math.round(deposit.amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservation.id}`,
            cancel_url: `${cancelUrl}?reservation_id=${reservation.id}`,
            client_reference_id: reservation.id,
            metadata: {
                reservation_id: reservation.id,
                type: 'reservation_deposit',
                restaurant_id: restaurantId
            },
            customer_email: reservation.customer_email, // Pre-fill email
        });

        return { success: true, session };

    } catch (error: any) {
        console.error('Stripe checkout session creation error:', error);

        // Provide user-friendly error messages based on Stripe error types
        if (error.type === 'StripeInvalidRequestError') {
            return { success: false, error: 'Payment system configuration error. Please contact the restaurant.' };
        } else if (error.type === 'StripeAuthenticationError') {
            return { success: false, error: 'Payment authentication failed. Please contact the restaurant.' };
        } else {
            return { success: false, error: 'Unable to process payment at this time. Please try again later.' };
        }
    }
}

// Clean up failed reservation if Stripe session creation fails
async function cleanupFailedReservation(reservationId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Delete table reservations to free up tables
            await tx.tableReservation.deleteMany({
                where: { reservation_id: reservationId }
            });

            // Delete payment record
            await tx.payment.deleteMany({
                where: { reservation_id: reservationId }
            });

            // Delete the reservation
            await tx.reservation.delete({
                where: { id: reservationId }
            });
        });
        console.log(`Cleaned up failed reservation: ${reservationId}`);
    } catch (cleanupError) {
        console.error('Failed to clean up reservation:', cleanupError);
    }
}

async function confirmReservation(reservationId: string) {
    await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'CONFIRMED' }
    });
}

// Helper functions (same as original API)
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
                    const dayOfWeek = arrivalTime.getDay();
                    const ruleDays = rule.days.split(',').map(d => parseInt(d.trim()));
                    isApplicable = ruleDays.includes(dayOfWeek);
                }
                break;
        }

        if (isApplicable) {
            applicableRules.push(rule);
        }
    });

    applicableRules.sort((a, b) => parseInt(b.priority) - parseInt(a.priority));

    let finalAmount = 0;
    let appliedRule: DynamicRule | undefined;

    if (applicableRules.length > 0) {
        appliedRule = applicableRules[0];
        const ruleAmount = parseFloat(appliedRule.amount || '0');

        if (appliedRule.depositType === 'per-person') {
            finalAmount = ruleAmount * partySize;
        } else {
            finalAmount = ruleAmount;
        }
    } else {
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

    const openTime = parseTime(daySchedule.open);
    const closeTime = parseTime(daySchedule.close);

    if (!openTime || !closeTime) {
        return {
            isOpen: false,
            error: 'Invalid opening hours configuration.'
        };
    }

    const arrivalDate = new Date(arrivalTimeInRestaurantTZ);
    const openDateTime = new Date(arrivalDate);
    openDateTime.setHours(openTime.hours, openTime.minutes, 0, 0);

    const closeDateTime = new Date(arrivalDate);
    closeDateTime.setHours(closeTime.hours, closeTime.minutes, 0, 0);

    if (arrivalTimeInRestaurantTZ < openDateTime || arrivalTimeInRestaurantTZ > closeDateTime) {
        return {
            isOpen: false,
            error: `Restaurant is open from ${daySchedule.open} to ${daySchedule.close} on ${dayName}.`
        };
    }

    return { isOpen: true };
}

function getDayName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
}

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
    const arrivalTimeInRestaurantTZ = new Date(
        arrivalTime.toLocaleString("en-US", { timeZone: restaurantTimezone })
    );

    const arrivalDateStr = arrivalTimeInRestaurantTZ.toISOString().split('T')[0];
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