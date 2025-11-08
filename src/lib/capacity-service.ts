import { Prisma, Table } from "@prisma/client";
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

    // Improved available tables search - FIXED VERSION
    async findAvailableTables(
        restaurantId: string,
        arrivalTime: Date,
        estimatedDuration: number,
        partySize: number,
        preferredArea?: string
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime);

        // Build query conditions - REMOVED min_party_size and max_party_size constraints
        const whereConditions: Prisma.TableWhereInput = {
            restaurant_id: restaurantId,
            status: 'ACTIVE',
            id: { notIn: occupiedTableIds },
            capacity: { gte: partySize } // ONLY check capacity
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
    // Enhanced table combination finder - FIXED VERSION
    async findTableCombinations(
        restaurantId: string,
        partySize: number,
        arrivalTime: Date,
        estimatedDuration: number,
        maxCombinationSize: number = 10
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime);

        console.log('=== OPTIMIZED COMBINATION FINDER ===');
        console.log('Party size:', partySize);
        console.log('Occupied tables:', occupiedTableIds.length);

        // Get available tables sorted by capacity ASCENDING (smallest first)
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
                { capacity: 'asc' } // CRITICAL: Smallest tables first for better combinations
            ]
        });

        console.log('Available tables (sorted by capacity ASC):', availableTables.map(t => ({
            table: t.table_number,
            capacity: t.capacity,
            area: t.area.name
        })));

        const totalAvailableCapacity = availableTables.reduce((sum, table) => sum + table.capacity, 0);
        console.log('Total available capacity:', totalAvailableCapacity);

        if (totalAvailableCapacity < partySize) {
            console.log('❌ INSUFFICIENT TOTAL CAPACITY');
            return [];
        }

        // Find ALL possible combinations using backtracking
        const allCombinations = this.findAllCombinations(availableTables, partySize, maxCombinationSize);

        console.log('All possible combinations found:', allCombinations.length);

        if (allCombinations.length === 0) {
            console.log('❌ NO VALID COMBINATIONS FOUND');
            return [];
        }

        // Find the optimal combination (minimum wasted capacity, then fewest tables)
        const optimalCombination = this.findOptimalCombination(allCombinations);

        console.log('✅ OPTIMAL COMBINATION:', {
            tables: optimalCombination.tables.map(t => `${t.table_number} (${t.capacity})`),
            totalCapacity: optimalCombination.totalCapacity,
            wastedCapacity: optimalCombination.wastedCapacity,
            tableCount: optimalCombination.tables.length
        });

        return [optimalCombination];
    }

    // NEW: Find all possible combinations using backtracking
    private findAllCombinations(
        availableTables: Table[],
        partySize: number,
        maxCombinationSize: number
    ): { tables: Table[]; totalCapacity: number; wastedCapacity: number }[] {
        const combinations: { tables: Table[]; totalCapacity: number; wastedCapacity: number }[] = [];

        function backtrack(start: number, currentTables: Table[], currentCapacity: number) {
            // If we've met or exceeded the required capacity, save this combination
            if (currentCapacity >= partySize) {
                const wastedCapacity = currentCapacity - partySize;
                combinations.push({
                    tables: [...currentTables],
                    totalCapacity: currentCapacity,
                    wastedCapacity: wastedCapacity
                });
            }

            // Stop if we've reached max combination size or no more tables
            if (currentTables.length >= maxCombinationSize || start >= availableTables.length) {
                return;
            }

            // Try including each remaining table
            for (let i = start; i < availableTables.length; i++) {
                const table = availableTables[i];
                currentTables.push(table);
                backtrack(i + 1, currentTables, currentCapacity + table.capacity);
                currentTables.pop();
            }
        }

        backtrack(0, [], 0);
        return combinations;
    }

    // NEW: Find the optimal combination (minimum waste, then fewest tables)
    private findOptimalCombination(
        combinations: { tables: Table[]; totalCapacity: number; wastedCapacity: number }[],
    ) {
        if (combinations.length === 0) {
            throw new Error('No combinations provided');
        }

        let optimalCombination = combinations[0];

        for (const combination of combinations) {
            // Prefer combinations with less wasted capacity
            if (combination.wastedCapacity < optimalCombination.wastedCapacity) {
                optimalCombination = combination;
            }
            // If same wasted capacity, prefer fewer tables
            else if (combination.wastedCapacity === optimalCombination.wastedCapacity &&
                combination.tables.length < optimalCombination.tables.length) {
                optimalCombination = combination;
            }
            // If same wasted capacity and table count, prefer smaller total capacity
            else if (combination.wastedCapacity === optimalCombination.wastedCapacity &&
                combination.tables.length === optimalCombination.tables.length &&
                combination.totalCapacity < optimalCombination.totalCapacity) {
                optimalCombination = combination;
            }
        }

        return optimalCombination;
    }
    // Add this method to your CapacityService class
    async findTableCombinationsOptimized(
        restaurantId: string,
        partySize: number,
        arrivalTime: Date,
        duration: number,
        maxCombinations: number = 20
    ): Promise<{ tables: Table[]; totalCapacity: number }[]> {

        const endTime = new Date(arrivalTime.getTime() + duration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime);

        const availableTables = await prisma.table.findMany({
            where: {
                restaurant_id: restaurantId,
                status: 'ACTIVE',
                id: { notIn: occupiedTableIds }
            },
            orderBy: {
                capacity: 'asc' // Start with smaller tables
            }
        });

        const combinations: { tables: Table[]; totalCapacity: number }[] = [];

        // Use a backtracking approach to find all valid combinations
        function findCombinations(startIndex: number, currentTables: Table[], currentCapacity: number) {
            if (currentCapacity >= partySize) {
                combinations.push({
                    tables: [...currentTables],
                    totalCapacity: currentCapacity
                });
                return;
            }

            if (combinations.length >= maxCombinations) return;

            for (let i = startIndex; i < availableTables.length; i++) {
                const table = availableTables[i];
                currentTables.push(table);
                findCombinations(i + 1, currentTables, currentCapacity + table.capacity);
                currentTables.pop();
            }
        }

        findCombinations(0, [], 0);

        // Sort by efficiency (minimal wasted capacity, then fewer tables)
        return combinations.sort((a, b) => {
            const wastedA = a.totalCapacity - partySize;
            const wastedB = b.totalCapacity - partySize;

            if (wastedA !== wastedB) {
                return wastedA - wastedB; // Less wasted capacity first
            }
            return a.tables.length - b.tables.length; // Fewer tables first
        });
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