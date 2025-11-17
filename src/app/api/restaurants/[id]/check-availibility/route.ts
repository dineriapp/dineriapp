import { SettingsState } from '@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types';
import { CapacityService } from '@/lib/capacity-service';
import prisma from '@/lib/prisma';
import { getEstimatedDuration } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;

        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date'); // "2025-11-13T05:00:00.000Z" - already in restaurant timezone as UTC
        const partySizeParam = searchParams.get('partySize');

        // All parameters are required
        if (!dateParam || !partySizeParam) {
            return NextResponse.json({
                error: 'Date and partySize parameters are required'
            }, { status: 400 });
        }

        const restaurantId = resolvedParams.id;
        const date = new Date(dateParam);

        if (isNaN(date.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        // Parse party size
        const partySize = parseInt(partySizeParam);
        if (isNaN(partySize) || partySize <= 0) {
            return NextResponse.json({ error: 'Invalid party size' }, { status: 400 });
        }

        const capacityService = new CapacityService();

        // Use the date directly since it already contains the full datetime
        const capacityData = await getReservationFeasibilityCheck(
            capacityService,
            restaurantId,
            date,
            partySize
        );

        return NextResponse.json({
            success: true,
            data: capacityData
        });

    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch capacity data' },
            { status: 500 }
        );
    }
}

// UPDATED: Removed separate time parameter since date already contains datetime
async function getReservationFeasibilityCheck(
    capacityService: CapacityService,
    restaurantId: string,
    date: Date, // This now contains the full datetime
    partySize: number
) {

    console.log('Date:', date.toISOString().split('T')[0]);


    // 1. Get restaurant and settings (same as reservation creation)
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
            reservation_settings: true,
        }
    });

    if (!restaurant) {
        return {
            canCreateReservation: false,
            reason: 'Restaurant not found',
            details: null
        };
    }

    const settings = restaurant?.reservation_settings?.settings as SettingsState | undefined;

    const estimatedDuration = getEstimatedDuration(settings, partySize);

    // Get restaurant timezone
    const restaurantTimezone = restaurant.timezone || 'Europe/London';

    // Convert the provided datetime to restaurant's timezone for validation
    const timeInRestaurantTZ = convertToRestaurantTimezone(date, restaurantTimezone);

    // 2. Check opening hours (same logic) - WITH PROPER TIMEZONE
    const openingHoursCheck = await checkOpeningHours(restaurant, timeInRestaurantTZ);
    if (!openingHoursCheck.isOpen) {
        return {
            canCreateReservation: false,
            reason: openingHoursCheck.error,
            details: { type: 'opening_hours' }
        };
    }

    // 3. Check time overrides (same logic) - WITH PROPER TIMEZONE
    const overrideCheck = await checkTimeOverrides(restaurant, timeInRestaurantTZ);
    if (overrideCheck.isBlocked) {
        return {
            canCreateReservation: false,
            reason: overrideCheck.error,
            details: { type: 'time_override' }
        };
    }

    // 4. Check capacity (same logic) - use original datetime for capacity checks
    const capacityCheck = await capacityService.checkCapacity(
        restaurantId,
        date, // Use the original datetime for capacity checks
        estimatedDuration,
        partySize
    );

    if (!capacityCheck.available) {
        return {
            canCreateReservation: false,
            reason: `Not enough capacity. Only ${capacityCheck.availableCapacity} seats available for this time.`,
            details: {
                type: 'capacity',
                availableCapacity: capacityCheck.availableCapacity,
                requiredCapacity: partySize
            }
        };
    }

    // 5. Get restaurant settings for table combinations
    const enableTableCombinations = settings?.restaurantSettings?.enable_table_combinations || false;

    // 6. Try to find available tables (OPTIMIZED LOGIC - IGNORE min/max party size)
    let assignedTables: any = [];

    // First try single table (IGNORE min/max constraints)
    const singleTable = await findBestTableByCapacityOnly(
        capacityService,
        restaurantId,
        date, // Use the original datetime for table availability
        estimatedDuration,
        partySize
    );

    if (singleTable) {
        assignedTables = [singleTable];
    }
    // If no single table and combinations are enabled, try combinations with optimized selection
    else if (enableTableCombinations) {

        // Get all available tables and find optimal combinations
        const combinations = await findOptimalTableCombinationsByCapacity(
            capacityService,
            restaurantId,
            date, // Use the original datetime for table availability
            estimatedDuration,
            partySize
        );

        if (combinations.length > 0) {
            // Select the combination with minimum wasted capacity
            const bestCombination = combinations[0];
            assignedTables = bestCombination.tables;
        }
    }

    // Final decision
    const canCreateReservation = assignedTables.length > 0;

    if (!canCreateReservation) {
        return {
            canCreateReservation: false,
            reason: 'No suitable tables available for the selected time and party size.',
        };
    }

    return {
        canCreateReservation: true,
        reason: 'Reservation can be created successfully',
    };
}

// Convert datetime to restaurant's timezone
function convertToRestaurantTimezone(datetime: Date, timezone: string): Date {
    // Create a new date with the same UTC time but interpreted in restaurant's timezone
    const localTimeString = datetime.toLocaleString("en-US", { timeZone: timezone });
    return new Date(localTimeString);
}

// Find single table using ONLY capacity (ignore min/max party size)
async function findBestTableByCapacityOnly(
    capacityService: CapacityService,
    restaurantId: string,
    datetime: Date, // Full datetime
    estimatedDuration: number,
    partySize: number
) {
    const endTime = new Date(datetime.getTime() + estimatedDuration * 60000);
    const occupiedTableIds = await capacityService['getOccupiedTableIds'](restaurantId, datetime, endTime, estimatedDuration);

    const availableTables = await prisma.table.findMany({
        where: {
            restaurant_id: restaurantId,
            status: 'ACTIVE',
            id: { notIn: occupiedTableIds },
            // ONLY check capacity, ignore min_party_size and max_party_size
            capacity: { gte: partySize }
        },
        orderBy: [
            // Prefer tables with capacity closest to party size (minimize waste)
            { capacity: 'asc' },
            // Secondary: prefer smaller tables if same capacity difference
            { id: 'asc' }
        ]
    });

    return availableTables[0] || null;
}

// Find optimal table combinations using ONLY capacity
async function findOptimalTableCombinationsByCapacity(
    capacityService: CapacityService,
    restaurantId: string,
    datetime: Date, // Full datetime
    estimatedDuration: number,
    partySize: number
): Promise<{ tables: any[]; totalCapacity: number; wastedCapacity: number }[]> {
    const endTime = new Date(datetime.getTime() + estimatedDuration * 60000);
    const occupiedTableIds = await capacityService['getOccupiedTableIds'](restaurantId, datetime, endTime, estimatedDuration);

    // Get all available tables (ignore min/max party size constraints)
    const availableTables = await prisma.table.findMany({
        where: {
            restaurant_id: restaurantId,
            status: 'ACTIVE',
            id: { notIn: occupiedTableIds }
        },
        orderBy: {
            capacity: 'asc' // Start with smaller tables for better combinations
        }
    });

    // Find all possible combinations that meet the capacity requirement
    const combinations: { tables: any[]; totalCapacity: number; wastedCapacity: number }[] = [];

    // Use a recursive function to find combinations
    function findCombinations(startIndex: number, currentCombination: any[], currentCapacity: number) {
        // If we've met or exceeded the required capacity, save this combination
        if (currentCapacity >= partySize) {
            const wastedCapacity = currentCapacity - partySize;
            combinations.push({
                tables: [...currentCombination],
                totalCapacity: currentCapacity,
                wastedCapacity: wastedCapacity
            });
            // Continue searching but don't add more tables to this path
            return;
        }

        // Try adding each remaining table
        for (let i = startIndex; i < availableTables.length; i++) {
            const table = availableTables[i];
            currentCombination.push(table);
            findCombinations(i + 1, currentCombination, currentCapacity + table.capacity);
            currentCombination.pop();
        }
    }

    // Start with empty combination
    findCombinations(0, [], 0);

    // Sort combinations by:
    // 1. Minimum wasted capacity (most efficient)
    // 2. Fewest number of tables (simpler setup)
    // 3. Smaller total capacity (if same waste and table count)
    return combinations.sort((a, b) => {
        if (a.wastedCapacity !== b.wastedCapacity) {
            return a.wastedCapacity - b.wastedCapacity; // Less waste first
        }
        if (a.tables.length !== b.tables.length) {
            return a.tables.length - b.tables.length; // Fewer tables first
        }
        return a.totalCapacity - b.totalCapacity; // Smaller total capacity first
    });
}

// Check opening hours with proper timezone support
async function checkOpeningHours(restaurant: any, arrivalTime: Date) {
    const openingHours = restaurant.opening_hours || {};

    // arrivalTime is already in restaurant's timezone
    const dayName = getDayName(arrivalTime);
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

    // Create date objects in restaurant's timezone for comparison
    const arrivalDate = new Date(arrivalTime);
    const openDateTime = new Date(arrivalDate);
    openDateTime.setHours(openTime.hours, openTime.minutes, 0, 0);

    const closeDateTime = new Date(arrivalDate);
    closeDateTime.setHours(closeTime.hours, closeTime.minutes, 0, 0);

    // Check if arrival time is within opening hours in restaurant's timezone
    if (arrivalTime < openDateTime || arrivalTime > closeDateTime) {
        return {
            isOpen: false,
            error: `Restaurant is open from ${daySchedule.open} to ${daySchedule.close} on ${dayName}.`
        };
    }

    return { isOpen: true };
}

// Check time overrides with proper timezone support
async function checkTimeOverrides(restaurant: any, arrivalTime: Date) {
    const settings = restaurant.reservation_settings?.settings as any;
    const overridesSettings = settings?.overrides_settings || {
        overrides_enabled: false,
        overrides: []
    };

    if (!overridesSettings.overrides_enabled) {
        return { isBlocked: false };
    }

    // arrivalTime is already in restaurant's timezone
    const arrivalDateStr = arrivalTime.toISOString().split('T')[0];

    // Use the arrival time (already in restaurant timezone) for minute calculation
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

// Helper functions
function getDayName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
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