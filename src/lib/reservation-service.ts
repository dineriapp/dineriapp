// lib/reservation-service.ts
export class ReservationService {
    private restaurantId: string;
    private settings: any;
    private openingHours: any;

    constructor(restaurantId: string, settings: any, openingHours: any) {
        this.restaurantId = restaurantId;
        this.settings = settings;
        this.openingHours = openingHours;
    }

    // Get day name from date
    getDayName(date: Date): string {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    // Parse time string to hours and minutes
    parseTime(timeStr: string): { hours: number, minutes: number } {
        if (!timeStr) return { hours: 0, minutes: 0 };

        const [time, period] = timeStr.split(' ');
        const [hoursStr, minutesStr] = time.split(':');

        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return { hours, minutes };
    }

    // Check if restaurant is open on the given date and time
    isRestaurantOpen(arrivalTime: Date): { isOpen: boolean; openTime?: string; closeTime?: string; reason?: string } {
        const dayName = this.getDayName(arrivalTime);
        const daySchedule = this.openingHours[dayName];

        if (!daySchedule || daySchedule.closed) {
            return {
                isOpen: false,
                reason: `Restaurant is closed on ${dayName}`
            };
        }

        // Check if time is within opening hours
        const openTime = this.parseTime(daySchedule.open);
        const closeTime = this.parseTime(daySchedule.close);
        const arrivalMinutes = arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
        const openMinutes = openTime.hours * 60 + openTime.minutes;
        const closeMinutes = closeTime.hours * 60 + closeTime.minutes;

        if (arrivalMinutes < openMinutes || arrivalMinutes > closeMinutes) {
            return {
                isOpen: false,
                openTime: daySchedule.open,
                closeTime: daySchedule.close,
                reason: `Restaurant is open from ${daySchedule.open} to ${daySchedule.close} on ${dayName}`
            };
        }

        return {
            isOpen: true,
            openTime: daySchedule.open,
            closeTime: daySchedule.close
        };
    }

    // Check if time slot is available (not blocked by overrides)
    isTimeSlotAvailable(arrivalTime: Date): { available: boolean; reason?: string } {
        const { overrides_settings } = this.settings;

        if (!overrides_settings?.overrides_enabled || !overrides_settings.overrides) {
            return { available: true };
        }

        const dateStr = arrivalTime.toISOString().split('T')[0];
        const timeStr = arrivalTime.toTimeString().slice(0, 5);

        for (const override of overrides_settings.overrides) {
            if (override.date === dateStr && override.blocked) {
                if (timeStr >= override.startTime && timeStr <= override.endTime) {
                    return {
                        available: false,
                        reason: `Time slot blocked: ${override.reason}`
                    };
                }
            }
        }

        return { available: true };
    }

    // Calculate estimated duration based on settings
    calculateEstimatedDuration(partySize: number): number {
        const { restaurantSettings } = this.settings;

        if (!restaurantSettings) {
            return 120; // Default fallback
        }

        if (restaurantSettings.use_tiered_duration) {
            if (partySize <= 2) {
                return restaurantSettings.small_party_duration;
            } else if (partySize <= 6) {
                return restaurantSettings.medium_party_duration;
            } else {
                return restaurantSettings.large_party_duration;
            }
        }

        if (restaurantSettings.enable_variable_duration) {
            const variableDuration = partySize * restaurantSettings.duration_per_guest_minutes;
            return Math.min(
                Math.max(variableDuration, restaurantSettings.min_reservation_duration_minutes),
                restaurantSettings.max_reservation_duration_minutes
            );
        }

        return restaurantSettings.default_reservation_duration_minutes;
    }

    // Calculate deposit amount based on rules
    calculateDepositAmount(partySize: number, arrivalTime: Date): number {
        const { deposit_settings } = this.settings;

        if (!deposit_settings?.depositSystemEnabled) {
            return 0;
        }

        // Apply dynamic rules in priority order
        if (deposit_settings.dynamicRules && deposit_settings.dynamicRules.length > 0) {
            const sortedRules = [...deposit_settings.dynamicRules].sort((a, b) =>
                parseInt(b.priority) - parseInt(a.priority)
            );

            for (const rule of sortedRules) {
                if (this.doesRuleApply(rule, partySize, arrivalTime)) {
                    if (rule.depositType === 'per-person') {
                        return partySize * parseFloat(rule.amount);
                    } else {
                        return parseFloat(rule.amount);
                    }
                }
            }
        }

        // Fallback to default deposit
        if (deposit_settings.depositType === 'per-person') {
            return partySize * parseFloat(deposit_settings.depositAmount || '0');
        } else {
            return parseFloat(deposit_settings.depositAmount || '0');
        }
    }

    private doesRuleApply(rule: any, partySize: number, arrivalTime: Date): boolean {
        const dayOfWeek = arrivalTime.getDay().toString();
        const timeStr = arrivalTime.toTimeString().slice(0, 5);

        switch (rule.ruleType) {
            case 'day-of-week':
                return rule.days?.includes(dayOfWeek) || false;

            case 'time-slot':
                return timeStr >= (rule.startTime || '00:00') &&
                    timeStr <= (rule.endTime || '23:59');

            case 'party-size':
                return partySize >= parseInt(rule.minPartySize || '1') &&
                    partySize <= parseInt(rule.maxPartySize || '999');

            case 'special-date':
                const dateStr = arrivalTime.toISOString().split('T')[0];
                return rule.date === dateStr;

            default:
                return false;
        }
    }

    // Generate available time slots for a date
    generateTimeSlots(date: Date, bookingInterval: number = 30): { time: string; display: string; available: boolean, reason?: string }[] {
        const dayName = this.getDayName(date);
        const daySchedule = this.openingHours[dayName];

        if (!daySchedule || daySchedule.closed) {
            return [];
        }

        const openTime = this.parseTime(daySchedule.open);
        const closeTime = this.parseTime(daySchedule.close);

        const availableSlots = [];
        const openMinutes = openTime.hours * 60 + openTime.minutes;
        const closeMinutes = closeTime.hours * 60 + closeTime.minutes;

        for (let minutes = openMinutes; minutes <= closeMinutes - 60; minutes += bookingInterval) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

            const slotTime = new Date(date);
            slotTime.setHours(hours, mins, 0, 0);

            // Check if time slot is available (not blocked by overrides)
            const timeSlotCheck = this.isTimeSlotAvailable(slotTime);
            const isAvailable = timeSlotCheck.available;

            // Format display time
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayTime = `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;

            availableSlots.push({
                time: timeString,
                display: displayTime,
                available: isAvailable,
                reason: !isAvailable ? timeSlotCheck.reason : "None"
            });
        }

        return availableSlots;
    }
}