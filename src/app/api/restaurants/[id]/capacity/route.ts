import { CapacityService } from '@/lib/capacity-service';
import prisma from '@/lib/prisma';
import { Table } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;

        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const timeParam = searchParams.get('time');
        const partySizeParam = searchParams.get('partySize');

        if (!dateParam) {
            return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
        }

        const restaurantId = resolvedParams.id;
        const date = new Date(dateParam);

        if (isNaN(date.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        // Parse time if provided
        let time: Date | null = null;
        let partySize: number | undefined;

        if (timeParam) {
            time = parseTimeString(timeParam, date);
            if (!time) {
                return NextResponse.json({ error: 'Invalid time format. Use HH:MM AM/PM format' }, { status: 400 });
            }
        }

        if (partySizeParam) {
            partySize = parseInt(partySizeParam);
            if (isNaN(partySize) || partySize <= 0) {
                return NextResponse.json({ error: 'Invalid party size' }, { status: 400 });
            }
        }

        const capacityService = new CapacityService();

        // Choose the appropriate query based on parameters
        let capacityData;
        if (time && partySize) {
            // Use the SAME LOGIC as reservation creation
            capacityData = await getReservationFeasibilityCheck(
                capacityService,
                restaurantId,
                date,
                time,
                partySize
            );
        } else if (time) {
            // Time-specific capacity overview
            capacityData = await getTimeSlotCapacityOverview(capacityService, restaurantId, date, time);
        } else {
            // Date-only overview
            capacityData = await getDailyCapacityOverview(restaurantId, date);
        }

        return NextResponse.json({
            success: true,
            data: capacityData
        });

    } catch (error) {
        console.error('Capacity API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch capacity data' },
            { status: 500 }
        );
    }
}

// EXACT SAME LOGIC AS RESERVATION CREATION - MIRRORED
async function getReservationFeasibilityCheck(
    capacityService: CapacityService,
    restaurantId: string,
    date: Date,
    time: Date,
    partySize: number
) {
    console.log('=== CAPACITY API: Reservation Feasibility Check ===');
    console.log('Date:', date.toISOString().split('T')[0]);
    console.log('Time:', time.toTimeString().split(' ')[0]);
    console.log('Party Size:', partySize);

    const estimatedDuration = 120; // Default 2-hour duration

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

    // 2. Check opening hours (same logic)
    const openingHoursCheck = await checkOpeningHours(restaurant, time);
    if (!openingHoursCheck.isOpen) {
        return {
            canCreateReservation: false,
            reason: openingHoursCheck.error,
            details: { type: 'opening_hours' }
        };
    }

    // 3. Check time overrides (same logic)
    const overrideCheck = await checkTimeOverrides(restaurant, time);
    if (overrideCheck.isBlocked) {
        return {
            canCreateReservation: false,
            reason: overrideCheck.error,
            details: { type: 'time_override' }
        };
    }

    // 4. Check capacity (same logic)
    const capacityCheck = await capacityService.checkCapacity(
        restaurantId,
        time,
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
    const settings = restaurant.reservation_settings?.settings as any;
    const enableTableCombinations = settings?.restaurantSettings?.enable_table_combinations || false;

    // 6. Try to find available tables (SAME LOGIC as reservation creation)
    let assignedTables: any = [];
    let tableMethod = 'none';
    let tableCombination = null;

    // First try single table
    const singleTable = await capacityService.findBestTable(
        restaurantId,
        time,
        estimatedDuration,
        partySize
    );

    if (singleTable) {
        assignedTables = [singleTable];
        tableMethod = 'single';
        console.log('Single table available:', singleTable.table_number);
    }
    // If no single table and combinations are enabled, try combinations
    else if (enableTableCombinations) {
        console.log('Looking for table combinations...');

        // Try the debug version first to see exactly what's happening
        let combinations = await capacityService.findTableCombinationsDebug(
            restaurantId,
            partySize,
            time,
            estimatedDuration
        );

        console.log('Debug combinations found:', combinations.length);

        // If debug version fails, try the fixed version
        if (combinations.length === 0) {
            combinations = await capacityService.findTableCombinations(
                restaurantId,
                partySize,
                time,
                estimatedDuration,
                10
            );
            console.log('Fixed combinations found:', combinations.length);
        }

        if (combinations.length > 0) {
            tableCombination = combinations[0];
            assignedTables = tableCombination.tables;
            tableMethod = 'combination';
            console.log('Table combination found:', assignedTables.map((t: Table) => t.table_number));
        }
    }

    // Final decision (SAME LOGIC as reservation creation)
    const canCreateReservation = assignedTables.length > 0;

    if (!canCreateReservation) {
        return {
            canCreateReservation: false,
            reason: 'No suitable tables available for the selected time and party size.',
            details: {
                type: 'table_availability',
                tableCombinationsEnabled: enableTableCombinations,
                availableCapacity: capacityCheck.availableCapacity
            }
        };
    }

    // Calculate deposit (same logic as reservation creation)
    const depositCalculation = calculateDepositOnServer(settings, time, partySize);
    const depositAmount = depositCalculation.amount;

    return {
        canCreateReservation: true,
        reason: 'Reservation can be created successfully',
        details: {
            type: 'available',
            tables: assignedTables.map((table: any) => ({
                id: table.id,
                tableNumber: table.table_number,
                name: table.name,
                capacity: table.capacity,
                area: table.area?.name || 'Unknown',
                minPartySize: table.min_party_size,
                maxPartySize: table.max_party_size
            })),
            tableMethod,
            tableCount: assignedTables.length,
            totalTableCapacity: assignedTables.reduce((sum: number, table: any) => sum + table.capacity, 0),
            deposit: {
                amount: depositAmount,
                currency: settings?.deposit_settings?.depositCurrency || 'EUR',
                required: depositAmount > 0
            },
            capacity: {
                total: capacityCheck.maxCapacity,
                available: capacityCheck.availableCapacity,
                utilized: capacityCheck.currentCapacity,
                utilizationPercentage: Math.round((capacityCheck.currentCapacity / capacityCheck.maxCapacity) * 100)
            },
            settings: {
                tableCombinationsEnabled: enableTableCombinations,
                estimatedDuration
            }
        }
    };
}

// Same helper functions as in reservation creation
async function checkOpeningHours(restaurant: any, arrivalTime: Date) {
    const openingHours = restaurant.opening_hours || {};
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

    const arrivalDate = new Date(arrivalTime);
    const openDateTime = new Date(arrivalDate);
    openDateTime.setHours(openTime.hours, openTime.minutes, 0, 0);

    const closeDateTime = new Date(arrivalDate);
    closeDateTime.setHours(closeTime.hours, closeTime.minutes, 0, 0);

    if (arrivalTime < openDateTime || arrivalTime > closeDateTime) {
        return {
            isOpen: false,
            error: `Restaurant is open from ${daySchedule.open} to ${daySchedule.close} on ${dayName}.`
        };
    }

    return { isOpen: true };
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

    const arrivalDateStr = arrivalTime.toISOString().split('T')[0];
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

// Same deposit calculation as reservation creation
function calculateDepositOnServer(
    settings: any,
    arrivalTime: Date,
    partySize: number
): { amount: number; appliedRule?: any } {

    if (!settings?.deposit_settings?.depositSystemEnabled) {
        return { amount: 0 };
    }

    const baseDepositAmount = parseFloat(settings.deposit_settings.depositAmount || '0');
    const dynamicRules = settings.deposit_settings.dynamicRules || [];

    // Filter applicable rules based on current selection
    const applicableRules: any[] = [];

    dynamicRules.forEach((rule: any) => {
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
                    const timeToMinutes = (timeStr: string) => {
                        const [time, period] = timeStr.split(' ');
                        const [hours, minutes] = time.split(':').map(Number);
                        let totalMinutes = hours % 12 * 60 + minutes;
                        if (period === 'PM') totalMinutes += 12 * 60;
                        return totalMinutes;
                    };

                    const arrivalMinutes = timeToMinutes(
                        arrivalTime.toLocaleTimeString('en-US', {
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
                    const ruleDays = rule.days.split(',').map((d: string) => parseInt(d.trim()));
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
    let appliedRule: any = undefined;

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

// Same helper functions as reservation creation
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

// Keep the existing functions for time slot overview and daily overview
async function getTimeSlotCapacityOverview(
    capacityService: CapacityService,
    restaurantId: string,
    date: Date,
    time: Date
) {
    const estimatedDuration = 120;

    const capacityCheck = await capacityService.checkCapacity(
        restaurantId,
        time,
        estimatedDuration,
        2
    );

    const availableTables = await getAvailableTablesByCapacity(capacityService, restaurantId, time, estimatedDuration);

    return {
        date: date.toISOString().split('T')[0],
        time: time.toTimeString().split(' ')[0],
        capacity: {
            total: capacityCheck.maxCapacity,
            available: capacityCheck.availableCapacity,
            utilized: capacityCheck.currentCapacity,
            utilizationPercentage: Math.round((capacityCheck.currentCapacity / capacityCheck.maxCapacity) * 100)
        },
        tableAvailability: {
            byCapacity: availableTables,
            totalAvailable: availableTables.reduce((sum, range) => sum + range.count, 0)
        },
        summary: {
            status: capacityCheck.available ? 'GOOD_AVAILABILITY' : 'LIMITED_AVAILABILITY',
            recommendedPartySizes: getRecommendedPartySizes(availableTables),
            peakHour: isPeakHour(time)
        }
    };
}

async function getDailyCapacityOverview(restaurantId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.$queryRaw`
    WITH capacity AS (
      SELECT COALESCE(SUM(capacity), 0) as total_capacity
      FROM tables 
      WHERE restaurant_id = ${restaurantId}::uuid 
      AND status = 'ACTIVE'
    ),
    reservation_stats AS (
      SELECT 
        COUNT(*) as total_reservations,
        COALESCE(SUM(party_size), 0) as total_guests,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'SEATED' THEN 1 END) as seated_count,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count,
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN party_size ELSE 0 END), 0) as pending_guests,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN party_size ELSE 0 END), 0) as confirmed_guests,
        COALESCE(SUM(CASE WHEN status = 'SEATED' THEN party_size ELSE 0 END), 0) as seated_guests
      FROM reservations 
      WHERE restaurant_id = ${restaurantId}::uuid 
      AND arrival_time >= ${startOfDay}
      AND arrival_time <= ${endOfDay}
    )
    SELECT 
      c.total_capacity::integer as total_capacity,
      rs.total_reservations::integer as total_reservations,
      rs.total_guests::integer as total_guests,
      rs.pending_count::integer as pending_count,
      rs.confirmed_count::integer as confirmed_count,
      rs.seated_count::integer as seated_count,
      rs.completed_count::integer as completed_count,
      rs.cancelled_count::integer as cancelled_count,
      rs.pending_guests::integer as pending_guests,
      rs.confirmed_guests::integer as confirmed_guests,
      rs.seated_guests::integer as seated_guests,
      CASE 
        WHEN c.total_capacity > 0 THEN 
          ROUND((rs.total_guests / c.total_capacity) * 100)
        ELSE 0 
      END::integer as utilization_percentage,
      CASE 
        WHEN rs.total_reservations > 0 THEN 
          ROUND(rs.total_guests / rs.total_reservations)
        ELSE 0 
      END::integer as average_party_size
    FROM capacity c, reservation_stats rs
  `;

    const data = (result as any[])[0];

    const safeNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        return Number(value);
    };

    const totalCapacity = safeNumber(data.total_capacity);
    const totalGuests = safeNumber(data.total_guests);
    const utilizationPercentage = safeNumber(data.utilization_percentage);

    const availableCapacity = Math.max(0, totalCapacity - totalGuests);

    return {
        date: date.toISOString().split('T')[0],
        capacity: {
            total: totalCapacity,
            available: availableCapacity,
            utilized: totalGuests,
            utilizationPercentage
        },
        reservations: {
            total: safeNumber(data.total_reservations),
            byStatus: {
                pending: safeNumber(data.pending_count),
                confirmed: safeNumber(data.confirmed_count),
                seated: safeNumber(data.seated_count),
                completed: safeNumber(data.completed_count),
                cancelled: safeNumber(data.cancelled_count)
            },
            guests: {
                total: totalGuests,
                pending: safeNumber(data.pending_guests),
                confirmed: safeNumber(data.confirmed_guests),
                seated: safeNumber(data.seated_guests),
                averagePartySize: safeNumber(data.average_party_size)
            }
        },
        summary: {
            isFullyBooked: utilizationPercentage >= 90,
            hasAvailability: utilizationPercentage < 80,
            bookingIntensity: getBookingIntensity(utilizationPercentage),
            recommendation: getBookingRecommendation(utilizationPercentage)
        }
    };
}

// Helper functions
async function getAvailableTablesByCapacity(
    capacityService: CapacityService,
    restaurantId: string,
    time: Date,
    estimatedDuration: number
) {
    const endTime = new Date(time.getTime() + estimatedDuration * 60000);
    const occupiedTableIds = await capacityService['getOccupiedTableIds'](restaurantId, time, endTime);

    const availableTables = await prisma.table.findMany({
        where: {
            restaurant_id: restaurantId,
            status: 'ACTIVE',
            id: { notIn: occupiedTableIds }
        },
        select: {
            capacity: true
        }
    });

    const ranges = [
        { range: '2-4', min: 2, max: 4, count: 0 },
        { range: '5-8', min: 5, max: 8, count: 0 },
        { range: '9-12', min: 9, max: 12, count: 0 },
        { range: '13+', min: 13, max: 999, count: 0 }
    ];

    availableTables.forEach(table => {
        for (const range of ranges) {
            if (table.capacity >= range.min && table.capacity <= range.max) {
                range.count++;
                break;
            }
        }
    });

    return ranges;
}

function getRecommendedPartySizes(availableTables: any[]): string[] {
    const recommendations = [];

    if (availableTables.find(r => r.range === '2-4')?.count > 0) {
        recommendations.push('2-4 people');
    }
    if (availableTables.find(r => r.range === '5-8')?.count > 0) {
        recommendations.push('5-8 people');
    }
    if (availableTables.find(r => r.range === '9-12')?.count > 0) {
        recommendations.push('9-12 people');
    }
    if (availableTables.find(r => r.range === '13+')?.count > 0) {
        recommendations.push('13+ people');
    }

    return recommendations.length > 0 ? recommendations : ['No tables available'];
}

function isPeakHour(time: Date): boolean {
    const hour = time.getHours();
    return (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21);
}

function parseTimeString(timeStr: string, baseDate: Date): Date | null {
    try {
        const time12HourMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
        if (time12HourMatch) {
            let hours = parseInt(time12HourMatch[1]);
            const minutes = parseInt(time12HourMatch[2]);
            const period = time12HourMatch[3].toUpperCase();

            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const result = new Date(baseDate);
            result.setHours(hours, minutes, 0, 0);
            return result;
        }

        const time24HourMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
        if (time24HourMatch) {
            const hours = parseInt(time24HourMatch[1]);
            const minutes = parseInt(time24HourMatch[2]);

            const result = new Date(baseDate);
            result.setHours(hours, minutes, 0, 0);
            return result;
        }

        return null;
    } catch {
        return null;
    }
}

function getBookingIntensity(utilization: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL' {
    if (utilization >= 90) return 'FULL';
    if (utilization >= 70) return 'HIGH';
    if (utilization >= 40) return 'MEDIUM';
    return 'LOW';
}

function getBookingRecommendation(utilization: number): string {
    if (utilization >= 90) {
        return 'Fully booked - consider waitlist only';
    } else if (utilization >= 70) {
        return 'High demand - limited availability remaining';
    } else if (utilization >= 40) {
        return 'Moderate availability - good time for bookings';
    } else {
        return 'Plenty of availability - encourage reservations';
    }
}