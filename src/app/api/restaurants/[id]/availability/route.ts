import { CapacityService } from '@/lib/capacity-service';
import prisma from '@/lib/prisma';
import { ReservationService } from '@/lib/reservation-service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const partySize = parseInt(searchParams.get('partySize') || '2');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Id Param is required' },
                { status: 400 }
            );
        }

        if (!date) {
            return NextResponse.json(
                { success: false, error: 'Date parameter is required' },
                { status: 400 }
            );
        }

        console.log('🔍 Fetching restaurant with ID:', id);

        // Method 1: Try the original query with better logging
        const restaurant = await prisma.restaurant.findFirst({
            where: { id: id },
            include: {
                reservation_settings: true,
            }
        });

        if (!restaurant) {
            return NextResponse.json(
                { success: false, error: 'Restaurant not found' },
                { status: 404 }
            );
        }

        // Method 2: If relation doesn't work, try direct query
        let settings;
        const openingHours = restaurant?.opening_hours as any
        if (restaurant.reservation_settings) {
            settings = restaurant.reservation_settings.settings;
        } else {
            console.log('🔄 Trying direct settings query...');
            const directSettings = await prisma.reservationSettings.findFirst({
                where: { restaurant_id: id }
            });

            if (directSettings) {
                settings = directSettings.settings;
            } else {
                console.log('❌ No settings found in database');
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Restaurant reservation settings not found. Please configure settings first.'
                    },
                    { status: 400 }
                );
            }
        }

        if (!settings || !openingHours) {
            return NextResponse.json(
                { success: false, error: 'Restaurant settings or opening hours not configured' },
                { status: 400 }
            );
        }

        // Now initialize services with the correct data
        const reservationService = new ReservationService(id, settings, openingHours);
        const capacityService = new CapacityService();

        const selectedDate = new Date(date);
        console.log('📅 Checking availability for date:', selectedDate.toISOString(), 'Party Size:', partySize, selectedDate.getTime());

        // Check if restaurant is open on this day
        const restaurantOpenCheck = reservationService.isRestaurantOpen(selectedDate);

        console.log('✅ Restaurant is open:', restaurantOpenCheck);

        if (!restaurantOpenCheck.isOpen) {
            return NextResponse.json({
                success: true,
                availableSlots: [],
                openingHours: null,
                message: restaurantOpenCheck.reason
            });
        }

        console.log('✅ Restaurant is open:', restaurantOpenCheck);

        // Get booking interval from settings
        // @ts-expect-error due to type issues
        const bookingInterval = settings.restaurantSettings?.booking_interval_minutes || 30;

        // Generate time slots based on opening hours
        const timeSlots = reservationService.generateTimeSlots(selectedDate, bookingInterval);

        // Check capacity for each time slot
        const availableSlotsWithCapacity = await Promise.all(
            timeSlots.map(async (slot) => {
                if (!slot.available) {
                    return { ...slot, available: false, reason: slot.reason };
                }

                const slotTime = new Date(selectedDate);
                const [hours, minutes] = slot.time.split(':').map(Number);
                slotTime.setHours(hours, minutes, 0, 0);

                // Calculate estimated duration for capacity check
                const estimatedDuration = reservationService.calculateEstimatedDuration(partySize);

                // Check capacity for this time slot
                try {
                    const capacityCheck = await capacityService.checkCapacity(
                        id,
                        slotTime,
                        estimatedDuration,
                        partySize
                    );

                    return {
                        ...slot,
                        available: capacityCheck.available,
                        availableCapacity: capacityCheck.availableCapacity,
                        reason: capacityCheck.available ? null : 'No capacity available'
                    };
                } catch {
                    return {
                        ...slot,
                        available: false,
                        reason: 'Error checking capacity'
                    };
                }
            })
        );

        return NextResponse.json({
            success: true,
            availableSlots: availableSlotsWithCapacity,
            openingHours: {
                open: restaurantOpenCheck.openTime,
                close: restaurantOpenCheck.closeTime
            },
            restaurant: {
                name: restaurant.name,
                timezone: restaurant.timezone
            }
        });

    } catch (error: any) {
        console.error('❌ Availability check error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}