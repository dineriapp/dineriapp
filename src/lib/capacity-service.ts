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

    // Improved capacity check with proper time range handling
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
        overlappingReservations: number;
    }> {
        const maxCapacity = await this.calculateTotalCapacity(restaurantId);
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);

        // Get ALL reservations that could potentially overlap
        const potentialReservations = await prisma.reservation.findMany({
            where: {
                restaurant_id: restaurantId,
                status: {
                    in: ['PENDING', 'CONFIRMED', 'SEATED']
                },
                // Get reservations that start within a reasonable window
                // (assuming no reservation lasts more than 4 hours)
                arrival_time: {
                    gte: new Date(arrivalTime.getTime() - 4 * 60 * 60000), // 4 hours before
                    lte: new Date(arrivalTime.getTime() + 4 * 60 * 60000)  // 4 hours after
                }
            },
            select: {
                party_size: true,
                estimated_duration_minutes: true,
                arrival_time: true,
                status: true
            }
        });

        let currentCapacity = 0;
        let overlappingCount = 0;

        for (const reservation of potentialReservations) {
            const reservationStart = new Date(reservation.arrival_time);
            const reservationEnd = new Date(
                reservationStart.getTime() +
                (reservation.estimated_duration_minutes || 120) * 60000
            );

            // Check if the reservations overlap in time
            if (this.doTimeRangesOverlap(
                { start: arrivalTime, end: endTime },
                { start: reservationStart, end: reservationEnd }
            )) {
                currentCapacity += reservation.party_size;
                overlappingCount++;
            }
        }

        const availableCapacity = Math.max(0, maxCapacity - currentCapacity);
        const available = (currentCapacity + partySize) <= maxCapacity;

        return {
            available,
            currentCapacity,
            maxCapacity,
            availableCapacity,
            overlappingReservations: overlappingCount
        };
    }

    // Helper to check if two time ranges overlap
    private doTimeRangesOverlap(
        range1: { start: Date; end: Date },
        range2: { start: Date; end: Date }
    ): boolean {
        return range1.start < range2.end && range1.end > range2.start;
    }

    // Improved available tables search with better business logic
    async findAvailableTables(
        restaurantId: string,
        arrivalTime: Date,
        estimatedDuration: number,
        partySize: number,
        preferredArea?: string
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime);

        // Build query conditions
        const whereConditions: Prisma.TableWhereInput = {
            restaurant_id: restaurantId,
            status: 'ACTIVE',
            id: { notIn: occupiedTableIds },
            capacity: { gte: partySize },
            min_party_size: { lte: partySize },
            max_party_size: { gte: partySize }
        };

        // Handle area preference
        if (preferredArea) {
            whereConditions.area = { name: preferredArea };
        }

        const availableTables = await prisma.table.findMany({
            where: whereConditions,
            include: {
                area: true
            },
            orderBy: [
                // Prefer tables that fit the party size perfectly
                { capacity: 'asc' },
                // Then by area preference
                { area: { sort_order: 'asc' } },
                // Then by table order
                { sort_order: 'asc' }
            ]
        });

        return availableTables;
    }
    // Smart table assignment with fallback logic
    async findBestTable(
        restaurantId: string,
        arrivalTime: Date,
        estimatedDuration: number,
        partySize: number,
        preferredArea?: string
    ) {
        // First try exact match in preferred area
        if (preferredArea) {
            const preferredTables = await this.findAvailableTables(
                restaurantId,
                arrivalTime,
                estimatedDuration,
                partySize,
                preferredArea
            );

            if (preferredTables.length > 0) {
                return preferredTables[0];
            }
        }

        // Fallback to any available table
        const fallbackTables = await this.findAvailableTables(
            restaurantId,
            arrivalTime,
            estimatedDuration,
            partySize
        );

        return fallbackTables[0] || null;
    }
    // Enhanced table combination finder
    async findTableCombinations(
        restaurantId: string,
        partySize: number,
        arrivalTime: Date,
        estimatedDuration: number,
        maxCombinationSize: number = 10
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime);

        console.log('=== FIXED COMBINATION FINDER ===');
        console.log('Party size:', partySize);
        console.log('Occupied tables:', occupiedTableIds.length);

        // Get available tables sorted by capacity DESCENDING (largest first)
        const availableTables = await prisma.table.findMany({
            where: {
                restaurant_id: restaurantId,
                status: 'ACTIVE',
                id: { notIn: occupiedTableIds }
            },
            include: {
                area: true
            },
            orderBy: [
                { capacity: 'desc' } // CRITICAL: Largest tables first
            ]
        });

        console.log('Available tables (sorted by capacity DESC):', availableTables.map(t => ({
            table: t.table_number,
            capacity: t.capacity,
            area: t.area.name
        })));

        const totalAvailableCapacity = availableTables.reduce((sum, table) => sum + table.capacity, 0);
        console.log('Total available capacity:', totalAvailableCapacity);

        // SIMPLE GREEDY ALGORITHM: Take largest tables until we meet capacity
        const selectedTables = [];
        let currentCapacity = 0;

        for (const table of availableTables) {
            if (currentCapacity >= partySize) break;
            if (selectedTables.length >= maxCombinationSize) break;

            selectedTables.push(table);
            currentCapacity += table.capacity;

            console.log(`Added ${table.table_number} (${table.capacity}), total: ${currentCapacity}`);
        }

        if (currentCapacity >= partySize) {
            console.log('✅ COMBINATION FOUND:', {
                tables: selectedTables.map(t => t.table_number),
                totalCapacity: currentCapacity,
                tableCount: selectedTables.length
            });

            return [{
                tables: selectedTables,
                totalCapacity: currentCapacity,
                area: selectedTables.map(t => t.area.name).join(', '),
                efficiency: currentCapacity - partySize,
                combinationType: 'greedy',
                tableCount: selectedTables.length
            }];
        }

        console.log('❌ NO COMBINATION FOUND');
        console.log('Max achievable capacity:', currentCapacity);
        return [];
    }
    // DEBUG VERSION - WILL DEFINITELY FIND COMBINATION IF CAPACITY EXISTS
    async findTableCombinationsDebug(
        restaurantId: string,
        partySize: number,
        arrivalTime: Date,
        estimatedDuration: number
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime);

        console.log('=== DEBUG COMBINATION FINDER ===');
        console.log('Target party size:', partySize);

        // Get ALL available tables without any filtering
        const allTables = await prisma.table.findMany({
            where: {
                restaurant_id: restaurantId,
                status: 'ACTIVE'
            },
            include: {
                area: true
            }
        });

        console.log('ALL tables in restaurant:', allTables.map(t => ({
            table: t.table_number,
            capacity: t.capacity,
            occupied: occupiedTableIds.includes(t.id)
        })));

        const availableTables = allTables.filter(table => !occupiedTableIds.includes(table.id));

        // MANUALLY sort by capacity descending
        availableTables.sort((a, b) => b.capacity - a.capacity);

        console.log('AVAILABLE tables (manually sorted):', availableTables.map(t => ({
            table: t.table_number,
            capacity: t.capacity,
            area: t.area.name
        })));

        const capacities = availableTables.map(t => t.capacity);
        console.log('Available capacities:', capacities);

        const totalAvailableCapacity = capacities.reduce((sum, cap) => sum + cap, 0);
        console.log('Total available capacity:', totalAvailableCapacity);

        // SIMPLE SOLUTION: Use tables until we reach capacity
        const selectedTables = [];
        let currentCapacity = 0;

        for (const table of availableTables) {
            selectedTables.push(table);
            currentCapacity += table.capacity;

            if (currentCapacity >= partySize) {
                break;
            }

            // Safety limit - don't use more than 10 tables
            if (selectedTables.length >= 10) {
                break;
            }
        }

        console.log('Final selection:', {
            tables: selectedTables.map(t => t.table_number),
            capacities: selectedTables.map(t => t.capacity),
            totalCapacity: currentCapacity,
            tableCount: selectedTables.length
        });

        if (currentCapacity >= partySize) {
            console.log('🎉 SUCCESS: Combination found!');
            return [{
                tables: selectedTables,
                totalCapacity: currentCapacity,
                area: selectedTables.map(t => t.area.name).join(', '),
                efficiency: currentCapacity - partySize,
                combinationType: 'debug',
                tableCount: selectedTables.length
            }];
        } else {
            console.log('💥 FAILED: Cannot reach required capacity');
            console.log('Available capacity:', currentCapacity, 'Needed:', partySize);
            return [];
        }
    }
    // Add this emergency debug method to your CapacityService
    async debugTableAvailability(
        restaurantId: string,
        arrivalTime: Date,
        estimatedDuration: number
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime);

        console.log('=== EMERGENCY TABLE DEBUG ===');
        console.log('Arrival:', arrivalTime);
        console.log('End:', endTime);
        console.log('Occupied table IDs:', occupiedTableIds);

        const allTables = await prisma.table.findMany({
            where: {
                restaurant_id: restaurantId,
                status: 'ACTIVE'
            },
            include: {
                area: true,
                table_reservations: {
                    where: {
                        reservation: {
                            arrival_time: {
                                gte: new Date(arrivalTime.getTime() - 4 * 60 * 60000),
                                lte: new Date(arrivalTime.getTime() + 4 * 60 * 60000)
                            },
                            status: {
                                in: ['PENDING', 'CONFIRMED', 'SEATED']
                            }
                        }
                    },
                    include: {
                        reservation: {
                            select: {
                                arrival_time: true,
                                estimated_duration_minutes: true,
                                party_size: true
                            }
                        }
                    }
                }
            },
            orderBy: { capacity: 'desc' }
        });

        console.log('=== ALL TABLES STATUS ===');
        allTables.forEach(table => {
            const isOccupied = occupiedTableIds.includes(table.id);
            const reservations = table.table_reservations;

            console.log(`Table ${table.table_number} (${table.capacity} people):`, {
                occupied: isOccupied,
                area: table.area.name,
                reservations: reservations.map(r => ({
                    time: r.reservation.arrival_time,
                    duration: r.reservation.estimated_duration_minutes,
                    party: r.reservation.party_size
                }))
            });
        });

        const availableTables = allTables.filter(table => !occupiedTableIds.includes(table.id));
        console.log('=== AVAILABLE TABLES SUMMARY ===');
        console.log('Total tables:', allTables.length);
        console.log('Available tables:', availableTables.length);
        console.log('Available capacities:', availableTables.map(t => t.capacity));
        console.log('Total available capacity:', availableTables.reduce((sum, t) => sum + t.capacity, 0));
    }
    // Add this to your CapacityService class
    private async getOccupiedTableIds(
        restaurantId: string,
        startTime: Date,
        endTime: Date
    ): Promise<string[]> {
        console.log('=== GET OCCUPIED TABLE IDs DEBUG ===');
        console.log('Time range:', startTime, 'to', endTime);

        const occupiedReservations = await prisma.tableReservation.findMany({
            where: {
                reservation: {
                    restaurant_id: restaurantId,
                    status: {
                        in: ['PENDING', 'CONFIRMED', 'SEATED']
                    },
                    arrival_time: {
                        gte: new Date(startTime.getTime() - 4 * 60 * 60000),
                        lte: new Date(startTime.getTime() + 4 * 60 * 60000)
                    }
                }
            },
            include: {
                reservation: {
                    select: {
                        arrival_time: true,
                        estimated_duration_minutes: true,
                        party_size: true
                    }
                },
                table: {
                    select: {
                        table_number: true,
                        capacity: true
                    }
                }
            }
        });

        console.log('All potential table reservations:', occupiedReservations.map(tr => ({
            table: tr.table.table_number,
            capacity: tr.table.capacity,
            reservationTime: tr.reservation.arrival_time,
            duration: tr.reservation.estimated_duration_minutes,
            partySize: tr.reservation.party_size
        })));

        const occupiedTableIds: string[] = [];

        for (const tr of occupiedReservations) {
            const reservationStart = new Date(tr.reservation.arrival_time);
            const reservationEnd = new Date(
                reservationStart.getTime() +
                (tr.reservation.estimated_duration_minutes || 120) * 60000
            );

            const overlaps = this.doTimeRangesOverlap(
                { start: startTime, end: endTime },
                { start: reservationStart, end: reservationEnd }
            );

            console.log(`Table ${tr.table.table_number}:`, {
                reservation: `${reservationStart.toISOString()} to ${reservationEnd.toISOString()}`,
                requested: `${startTime.toISOString()} to ${endTime.toISOString()}`,
                overlaps: overlaps
            });

            if (overlaps) {
                occupiedTableIds.push(tr.table_id);
            }
        }

        console.log('Final occupied table IDs:', occupiedTableIds);
        return [...new Set(occupiedTableIds)]; // Remove duplicates
    }
    // Get capacity timeline for the day
    async getDailyCapacityTimeline(restaurantId: string, date: Date) {
        const timeline = [];
        const totalCapacity = await this.calculateTotalCapacity(restaurantId);

        // Check capacity every 2 hours
        for (let hour = 8; hour <= 22; hour += 2) {
            const checkTime = new Date(date);
            checkTime.setHours(hour, 0, 0, 0);

            const capacityCheck = await this.checkCapacity(
                restaurantId,
                checkTime,
                120, // 2-hour reservation
                2    // Check for minimum party size
            );

            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;

            timeline.push({
                time: `${displayHour}:00 ${period}`,
                hour: `${hour.toString().padStart(2, '0')}:00`,
                available: capacityCheck.available,
                currentCapacity: capacityCheck.currentCapacity,
                availableCapacity: capacityCheck.availableCapacity,
                utilization: Math.round((capacityCheck.currentCapacity / totalCapacity) * 100)
            });
        }

        return timeline;
    }
}