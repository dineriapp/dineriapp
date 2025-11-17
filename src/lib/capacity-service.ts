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
                (120) * 60000
                // (reservation.estimated_duration_minutes || 120) * 60000
                // -------fixxxxxxxx

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
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime, estimatedDuration);

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
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime, estimatedDuration);

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

        const totalAvailableCapacity = availableTables.reduce((sum, table) => sum + table.capacity, 0);

        if (totalAvailableCapacity < partySize) {
            return [];
        }

        // Find ALL possible combinations using backtracking
        const allCombinations = this.findAllCombinations(availableTables, partySize, maxCombinationSize);

        if (allCombinations.length === 0) {
            return [];
        }

        // Find the optimal combination (minimum wasted capacity, then fewest tables)
        const optimalCombination = this.findOptimalCombination(allCombinations);

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
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime, duration);

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
    // WILL DEFINITELY FIND COMBINATION IF CAPACITY EXISTS
    async findTableCombinationsDebug(
        restaurantId: string,
        partySize: number,
        arrivalTime: Date,
        estimatedDuration: number
    ) {
        const endTime = new Date(arrivalTime.getTime() + estimatedDuration * 60000);
        const occupiedTableIds = await this.getOccupiedTableIds(restaurantId, arrivalTime, endTime, estimatedDuration);

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

        const availableTables = allTables.filter(table => !occupiedTableIds.includes(table.id));

        // MANUALLY sort by capacity descending
        availableTables.sort((a, b) => b.capacity - a.capacity);

        // Use tables until we reach capacity
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

        if (currentCapacity >= partySize) {
            return [{
                tables: selectedTables,
                totalCapacity: currentCapacity,
                area: selectedTables.map(t => t.area.name).join(', '),
                efficiency: currentCapacity - partySize,
                combinationType: 'debug',
                tableCount: selectedTables.length
            }];
        } else {
            return [];
        }
    }
    private async getOccupiedTableIds(
        restaurantId: string,
        startTime: Date,
        endTime: Date,
        estimatedDuration: number
    ): Promise<string[]> {
        const occupiedReservations = await prisma.tableReservation.findMany({
            where: {
                reservation: {
                    restaurant_id: restaurantId,
                    status: {
                        in: ['PENDING', 'CONFIRMED', 'SEATED']
                    },
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

        const occupiedTableIds: string[] = [];

        for (const tr of occupiedReservations) {
            const reservationStart = new Date(tr.reservation.arrival_time);
            const reservationEnd = new Date(
                reservationStart.getTime() +
                (estimatedDuration) * 60000
            );

            const overlaps = this.doTimeRangesOverlap(
                { start: startTime, end: endTime },
                { start: reservationStart, end: reservationEnd }
            );
            if (overlaps) {
                occupiedTableIds.push(tr.table_id);
            }
        }
        return [...new Set(occupiedTableIds)];
    }
}