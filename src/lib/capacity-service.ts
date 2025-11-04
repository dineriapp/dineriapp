import { Prisma } from "@prisma/client";
import prisma from "./prisma";

export class CapacityService {

    // Calculate total restaurant capacity dynamically from tables
    async calculateTotalCapacity(restaurantId: string): Promise<number> {
        const tables = await prisma.table.findMany({
            where: {
                restaurant_id: restaurantId,
                status: 'ACTIVE'
            },
            select: {
                capacity: true
            }
        });

        return tables.reduce((total, table) => total + table.capacity, 0);
    }

    // Check capacity for a specific time slot
    async checkCapacity(
        restaurantId: string,
        arrivalTime: Date,
        estimatedDuration: number,
        partySize: number
    ): Promise<{
        available: boolean;
        currentCapacity: number;
        maxCapacity: number;
        availableCapacity: number;
    }> {

        // Calculate max capacity dynamically from tables
        const maxCapacity = await this.calculateTotalCapacity(restaurantId);

        // Get overlapping reservations
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);

        const overlappingReservations = await prisma.reservation.findMany({
            where: {
                restaurant_id: restaurantId,
                status: {
                    in: ['PENDING', 'CONFIRMED', 'SEATED']
                },
                OR: [
                    {
                        // Reservation starts during our reservation
                        arrival_time: {
                            gte: arrivalTime,
                            lt: endTime
                        }
                    },
                    {
                        // Reservation ends during our reservation
                        AND: [
                            {
                                arrival_time: {
                                    lt: arrivalTime
                                }
                            },
                            {
                                estimated_duration_minutes: {
                                    not: null
                                }
                            }
                        ]
                    },
                    {
                        // Reservation spans our entire reservation
                        AND: [
                            {
                                arrival_time: {
                                    lte: arrivalTime
                                }
                            },
                            {
                                estimated_duration_minutes: {
                                    not: null
                                }
                            }
                        ]
                    }
                ]
            },
            select: {
                party_size: true,
                estimated_duration_minutes: true,
                arrival_time: true
            }
        });

        // Calculate total capacity used during the overlapping period
        let currentCapacity = 0;
        for (const reservation of overlappingReservations) {
            const reservationEndTime = new Date(
                new Date(reservation.arrival_time).getTime() +
                (reservation.estimated_duration_minutes || 60) * 60000
            );

            // Check if reservations overlap
            if (arrivalTime < reservationEndTime && endTime > new Date(reservation.arrival_time)) {
                currentCapacity += reservation.party_size;
            }
        }

        const availableCapacity = maxCapacity - currentCapacity;
        const available = (currentCapacity + partySize) <= maxCapacity;

        return {
            available,
            currentCapacity,
            maxCapacity,
            availableCapacity
        };
    }

    // Find available tables for a time slot considering business rules
    async findAvailableTables(
        restaurantId: string,
        arrivalTime: Date,
        estimatedDuration: number,
        partySize: number,
        preferredArea?: string
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);

        // Get occupied table IDs during the requested time
        const occupiedTableIds = await this.getOccupiedTableIds(
            restaurantId,
            arrivalTime,
            endTime
        );

        // Build base conditions
        const baseConditions: any = {
            restaurant_id: restaurantId,
            status: 'ACTIVE',
            id: {
                notIn: occupiedTableIds
            },
            // CRITICAL: Check both physical capacity AND business rules
            capacity: {
                gte: partySize // Must physically fit
            },
            min_party_size: {
                lte: partySize // Party must meet minimum requirement
            },
            max_party_size: {
                gte: partySize // Party must not exceed maximum
            }
        };

        // Add area preference if specified
        if (preferredArea) {
            baseConditions.area = {
                name: preferredArea
            };
        }

        // Find available tables that can accommodate the party
        const availableTables = await prisma.table.findMany({
            where: baseConditions,
            include: {
                area: true
            },
            orderBy: [
                { capacity: 'asc' }, // Prefer smallest table that fits
                { sort_order: 'asc' }
            ]
        });

        return availableTables;
    }

    // Smart table assignment that considers business rules and preferences
    async findBestTable(
        restaurantId: string,
        partySize: number,
        preferredArea?: string
    ) {
        const baseConditions: Prisma.TableWhereInput = {
            restaurant_id: restaurantId,
            status: 'ACTIVE',
            capacity: { gte: partySize },
            min_party_size: { lte: partySize },
            max_party_size: { gte: partySize }
        };

        // Try preferred area first
        if (preferredArea) {
            const preferredTables = await prisma.table.findMany({
                where: {
                    ...baseConditions,
                    area: {
                        name: preferredArea
                    }
                },
                include: { area: true },
                orderBy: [{ capacity: 'asc' }] // Prefer best fit
            });

            if (preferredTables.length > 0) {
                return preferredTables[0];
            }
        }

        // Fallback to any available table
        const fallbackTables = await prisma.table.findMany({
            where: baseConditions,
            include: { area: true },
            orderBy: [{ capacity: 'asc' }] // Prefer best fit
        });

        return fallbackTables[0] || null;
    }

    // Check if we can accommodate a party by combining tables
    async findTableCombinations(
        restaurantId: string,
        partySize: number,
        arrivalTime: Date,
        estimatedDuration: number
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(
            restaurantId,
            arrivalTime,
            endTime
        );

        const availableTables = await prisma.table.findMany({
            where: {
                restaurant_id: restaurantId,
                status: 'ACTIVE',
                id: {
                    notIn: occupiedTableIds
                }
            },
            include: { area: true },
            orderBy: [{ capacity: 'desc' }] // Start with largest tables
        });

        // Simple combination logic - in production you'd want more sophisticated
        const combinations = [];

        // Try to find single table first
        const singleTable = availableTables.find(table => table.capacity >= partySize);
        if (singleTable) {
            combinations.push([singleTable]);
        }

        // Find combinations of 2 tables
        for (let i = 0; i < availableTables.length; i++) {
            for (let j = i + 1; j < availableTables.length; j++) {
                const table1 = availableTables[i];
                const table2 = availableTables[j];

                // Check if tables are in the same area (for practical seating)
                if (table1.area_id === table2.area_id) {
                    const combinedCapacity = table1.capacity + table2.capacity;
                    if (combinedCapacity >= partySize) {
                        combinations.push([table1, table2]);
                    }
                }
            }
        }

        // Sort combinations by how close they are to the required capacity (most efficient first)
        combinations.sort((a, b) => {
            const capacityA = a.reduce((sum, table) => sum + table.capacity, 0);
            const capacityB = b.reduce((sum, table) => sum + table.capacity, 0);

            const diffA = Math.abs(capacityA - partySize);
            const diffB = Math.abs(capacityB - partySize);

            return diffA - diffB;
        });

        return combinations;
    }

    // Get table occupancy for a time period
    async getTableOccupancy(
        restaurantId: string,
        startTime: Date,
        endTime: Date
    ) {
        const occupiedReservations = await prisma.tableReservation.findMany({
            where: {
                reservation: {
                    restaurant_id: restaurantId,
                    status: {
                        in: ['PENDING', 'CONFIRMED', 'SEATED']
                    },
                    OR: [
                        {
                            arrival_time: {
                                gte: startTime,
                                lt: endTime
                            }
                        },
                        {
                            AND: [
                                {
                                    arrival_time: {
                                        lt: startTime
                                    }
                                },
                                {
                                    estimated_duration_minutes: {
                                        not: null
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            include: {
                table: true,
                reservation: {
                    select: {
                        arrival_time: true,
                        estimated_duration_minutes: true,
                        party_size: true
                    }
                }
            }
        });

        return occupiedReservations;
    }

    // Get available time slots for a specific date
    async getAvailableTimeSlots(
        restaurantId: string,
        date: Date,
        partySize: number,
        duration: number = 120
    ) {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                reservation_settings: true
            }
        });

        if (!restaurant || !restaurant.reservation_settings) {
            throw new Error('Restaurant or settings not found');
        }

        const settings = restaurant.reservation_settings.settings as any;
        const openingHours = settings.opening_hours || {};

        const dayName = this.getDayName(date);
        const daySchedule = openingHours[dayName];

        if (!daySchedule || daySchedule.closed) {
            return []; // No available slots if closed
        }

        const bookingInterval = settings.restaurantSettings?.booking_interval_minutes || 30;
        const openTime = this.parseTime(daySchedule.open);
        const closeTime = this.parseTime(daySchedule.close);

        const availableSlots = [];
        const openMinutes = openTime.hours * 60 + openTime.minutes;
        const closeMinutes = closeTime.hours * 60 + closeTime.minutes;

        for (let minutes = openMinutes; minutes <= closeMinutes - duration; minutes += bookingInterval) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            const slotTime = new Date(date);
            slotTime.setHours(hours, mins, 0, 0);

            // Check capacity for this time slot
            const capacityCheck = await this.checkCapacity(
                restaurantId,
                slotTime,
                duration,
                partySize
            );

            if (capacityCheck.available) {
                // Format display time
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                const displayTime = `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;

                availableSlots.push({
                    time: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
                    display: displayTime,
                    available: true,
                    availableCapacity: capacityCheck.availableCapacity
                });
            }
        }

        return availableSlots;
    }

    // Helper method to get occupied table IDs for a time period
    private async getOccupiedTableIds(
        restaurantId: string,
        startTime: Date,
        endTime: Date
    ): Promise<string[]> {
        const occupiedReservations = await prisma.tableReservation.findMany({
            where: {
                reservation: {
                    restaurant_id: restaurantId,
                    status: {
                        in: ['PENDING', 'CONFIRMED', 'SEATED']
                    },
                    OR: [
                        {
                            arrival_time: {
                                gte: startTime,
                                lt: endTime
                            }
                        },
                        {
                            AND: [
                                {
                                    arrival_time: {
                                        lt: startTime
                                    }
                                },
                                {
                                    estimated_duration_minutes: {
                                        not: null
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            select: {
                table_id: true
            }
        });

        return occupiedReservations.map(r => r.table_id);
    }

    // Helper method to get day name
    private getDayName(date: Date): string {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    // Helper method to parse time string
    private parseTime(timeStr: string): { hours: number, minutes: number } {
        if (!timeStr) return { hours: 0, minutes: 0 };

        const [time, period] = timeStr.split(' ');
        const [hoursStr, minutesStr] = time.split(':');

        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return { hours, minutes };
    }

    // Get restaurant utilization statistics
    async getRestaurantUtilization(restaurantId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const reservations = await prisma.reservation.findMany({
            where: {
                restaurant_id: restaurantId,
                arrival_time: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ['PENDING', 'CONFIRMED', 'SEATED']
                }
            },
            select: {
                arrival_time: true,
                estimated_duration_minutes: true,
                party_size: true,
                status: true
            },
            orderBy: {
                arrival_time: 'asc'
            }
        });

        const totalCapacity = await this.calculateTotalCapacity(restaurantId);

        // Calculate hourly utilization
        const hourlyUtilization: { [hour: string]: number } = {};

        for (let hour = 0; hour < 24; hour++) {
            const hourStart = new Date(date);
            hourStart.setHours(hour, 0, 0, 0);

            const hourEnd = new Date(date);
            hourEnd.setHours(hour, 59, 59, 999);

            let hourCapacity = 0;

            for (const reservation of reservations) {
                const reservationStart = new Date(reservation.arrival_time);
                const reservationEnd = new Date(reservation.arrival_time.getTime() + (reservation.estimated_duration_minutes || 120) * 60000);

                // Check if reservation overlaps with this hour
                if (reservationStart <= hourEnd && reservationEnd >= hourStart) {
                    hourCapacity += reservation.party_size;
                }
            }

            const utilizationPercent = totalCapacity > 0 ? (hourCapacity / totalCapacity) * 100 : 0;
            hourlyUtilization[`${hour}:00`] = Math.min(utilizationPercent, 100);
        }

        return {
            date,
            totalReservations: reservations.length,
            totalCapacity,
            estimatedTotalGuests: reservations.reduce((sum, r) => sum + r.party_size, 0),
            hourlyUtilization,
            peakHours: Object.entries(hourlyUtilization)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([v, utilization]) => utilization > 70)
                .map(([hour]) => hour)
        };
    }
}