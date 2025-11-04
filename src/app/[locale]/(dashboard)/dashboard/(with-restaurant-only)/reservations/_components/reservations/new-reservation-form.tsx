"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Calendar, Clock, CreditCard, DollarSign, MapPin, Plus, Users } from "lucide-react";

import LoadingUI from "@/components/loading-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAreas } from "@/lib/area-queries";
import { OpeningHoursData, RestaurantWithCount } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { SettingsState } from "../settings/types";

// Format time slots for dropdown (30-min intervals)
const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
});

const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const date = new Date();
    date.setHours(Math.floor(i / 2), i % 2 === 0 ? 0 : 30, 0, 0);
    const str = fmt.format(date);
    return { value: str, label: str };
});

interface DynamicRule {
    id: number;
    ruleType: 'special-date' | 'time-slot' | 'party-size' | 'day-of-week';
    amount: string;
    priority: string;
    depositType: 'per-person' | 'flat-rate';
    date?: string;
    startTime?: string;
    endTime?: string;
    minPartySize?: string;
    maxPartySize?: string;
    days?: string;
}

interface TimeOverride {
    id: string;
    date: string;
    reason: string;
    blocked: boolean;
    startTime: string;
    endTime: string;
}

interface OverridesSettings {
    overrides_enabled: boolean;
    overrides: TimeOverride[];
}

const NewReservationForm = ({ restaurant }: { restaurant: RestaurantWithCount }) => {
    const { data: areas = [], isLoading } = useAreas(restaurant?.id);

    const settings = restaurant?.reservation_settings?.settings as SettingsState | undefined;

    const overrides_settings = useMemo<OverridesSettings>(() => {
        return (
            restaurant?.reservation_settings?.settings?.overrides_settings || {
                overrides_enabled: false,
                overrides: [],
            }
        )
    }, [restaurant])


    const openingHours = useMemo(() => {
        return restaurant.opening_hours
            ? (restaurant.opening_hours as OpeningHoursData)
            : {
                friday: { open: "", close: "", closed: true },
                monday: { open: "08:00 AM", close: "04:30 PM", closed: false },
                sunday: { open: "09:00 AM", close: "08:00 PM", closed: false },
                tuesday: { open: "06:00 AM", close: "09:00 PM", closed: false },
                saturday: { open: "06:00 AM", close: "07:00 PM", closed: false },
                thursday: { open: "06:00 AM", close: "06:00 PM", closed: false },
                wednesday: { open: "", close: "", closed: true },
            };
    }, [restaurant.opening_hours]);

    // --- State ---
    const [date, setDate] = useState<Date | undefined>();
    const [partySize, setPartySize] = useState("2");
    const [selectedTime, setSelectedTime] = useState("");
    const [area, setArea] = useState("none");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
    const [openTimes, setOpenTimes] = useState<{ open?: string; close?: string; closed?: boolean }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Time conversion helper function - FOR OVERRIDES ONLY
    const timeToMinutes = (timeStr: string): number => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = hours % 12 * 60 + minutes;
        if (period === 'PM') totalMinutes += 12 * 60;
        return totalMinutes;
    };

    // --- OVERRIDE SYSTEM (Completely separate from deposit calculation) ---

    // Check for time overrides
    const checkTimeOverride = (): { isBlocked: boolean; override?: TimeOverride } => {
        // If overrides are disabled, no blocking
        if (!overrides_settings.overrides_enabled) {
            return { isBlocked: false };
        }

        // If no date or time selected, no blocking
        if (!date || !selectedTime) {
            return { isBlocked: false };
        }

        const selectedDateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const selectedMinutes = timeToMinutes(selectedTime);

        // Check all overrides for matches
        for (const override of overrides_settings.overrides) {
            // Check if the override date matches
            if (override.date === selectedDateStr && override.blocked) {
                const startMinutes = timeToMinutes(override.startTime);
                const endMinutes = timeToMinutes(override.endTime);

                // Check if selected time falls within the blocked range
                if (selectedMinutes >= startMinutes && selectedMinutes <= endMinutes) {
                    return { isBlocked: true, override };
                }
            }
        }

        return { isBlocked: false };
    };

    // Check if there are any overrides for the selected date (even without time selection)
    const checkDateOverrides = (): { hasOverrides: boolean; overrides: TimeOverride[] } => {
        if (!overrides_settings.overrides_enabled || !date) {
            return { hasOverrides: false, overrides: [] };
        }

        const selectedDateStr = date.toISOString().split('T')[0];
        const dateOverrides = overrides_settings.overrides.filter(
            override => override.date === selectedDateStr && override.blocked
        );

        return {
            hasOverrides: dateOverrides.length > 0,
            overrides: dateOverrides
        };
    };

    const { isBlocked: isTimeBlocked, override: activeOverride } = checkTimeOverride();
    const { hasOverrides: hasDateOverrides, overrides: dateOverrides } = checkDateOverrides();

    // --- DEPOSIT CALCULATION SYSTEM (Completely separate from overrides) ---

    // Enhanced deposit calculation with dynamic rules
    const calculateDeposit = (): { amount: number; appliedRule?: DynamicRule } => {
        if (!settings?.deposit_settings?.depositSystemEnabled) {
            return { amount: 0 };
        }

        const baseDepositAmount = parseFloat(settings.deposit_settings.depositAmount || '0');
        const partySizeNum = parseInt(partySize, 10);
        const dynamicRules = settings.deposit_settings.dynamicRules || [];

        // Filter applicable rules based on current selection
        const applicableRules: DynamicRule[] = [];

        dynamicRules.forEach((rule: DynamicRule) => {
            let isApplicable = false;

            switch (rule.ruleType) {
                case 'special-date':
                    if (date && rule.date) {
                        const ruleDate = new Date(rule.date);
                        const selectedDate = new Date(date);
                        isApplicable = ruleDate.toDateString() === selectedDate.toDateString();
                    }
                    break;

                case 'time-slot':
                    if (selectedTime && rule.startTime && rule.endTime) {
                        // Use a separate time conversion for deposit rules to keep systems independent
                        const depositTimeToMinutes = (timeStr: string) => {
                            const [time, period] = timeStr.split(' ');
                            const [hours, minutes] = time.split(':').map(Number);
                            let totalMinutes = hours % 12 * 60 + minutes;
                            if (period === 'PM') totalMinutes += 12 * 60;
                            return totalMinutes;
                        };

                        const selectedMinutes = depositTimeToMinutes(selectedTime);
                        const startMinutes = depositTimeToMinutes(rule.startTime);
                        const endMinutes = depositTimeToMinutes(rule.endTime);

                        isApplicable = selectedMinutes >= startMinutes && selectedMinutes <= endMinutes;
                    }
                    break;

                case 'party-size':
                    if (rule.minPartySize && rule.maxPartySize) {
                        const min = parseInt(rule.minPartySize);
                        const max = parseInt(rule.maxPartySize);
                        isApplicable = partySizeNum >= min && partySizeNum <= max;
                    }
                    break;

                case 'day-of-week':
                    if (date && rule.days) {
                        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
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
                finalAmount = ruleAmount * partySizeNum;
            } else {
                finalAmount = ruleAmount;
            }
        } else {
            // Use base deposit settings
            if (settings.deposit_settings.depositType === 'per-person') {
                finalAmount = baseDepositAmount * partySizeNum;
            } else {
                finalAmount = baseDepositAmount;
            }
        }

        return { amount: finalAmount, appliedRule };
    };

    const { amount: depositAmount, appliedRule } = calculateDeposit();

    // --- Determine open/close for selected date based on client timezone ---
    useEffect(() => {
        if (!date) return;
        const clientDay = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        const dayStatus = openingHours[clientDay as keyof OpeningHoursData];
        setOpenTimes(dayStatus);
    }, [date, openingHours]);

    // Memoize available times only if restaurant open and not blocked by overrides
    const availableTimeSlots = useMemo(() => {
        if (!openTimes || openTimes.closed) return [];
        const openIndex = timeSlots.findIndex((t) => t.value === openTimes.open);
        const closeIndex = timeSlots.findIndex((t) => t.value === openTimes.close);
        if (openIndex === -1 || closeIndex === -1) return timeSlots;

        let availableSlots = timeSlots.slice(openIndex, closeIndex + 1);

        // Filter out times that are blocked by overrides
        if (overrides_settings.overrides_enabled && date) {
            const selectedDateStr = date.toISOString().split('T')[0];

            availableSlots = availableSlots.filter(slot => {
                const slotMinutes = timeToMinutes(slot.value);

                // Check if this time slot is blocked by any override
                const isBlocked = overrides_settings.overrides.some(override => {
                    if (override.date === selectedDateStr && override.blocked) {
                        const startMinutes = timeToMinutes(override.startTime);
                        const endMinutes = timeToMinutes(override.endTime);
                        return slotMinutes >= startMinutes && slotMinutes <= endMinutes;
                    }
                    return false;
                });

                return !isBlocked;
            });
        }

        return availableSlots;
    }, [openTimes, date, overrides_settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!date || !selectedTime) {
            alert("Please select date and time");
            setIsSubmitting(false);
            return;
        }

        // Check for time override before submitting
        if (isTimeBlocked) {
            alert("This time slot is currently unavailable. Please select a different time.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Combine date and time
            const [time, period] = selectedTime.split(' ');
            const [h, m] = time.split(':').map(Number);
            let hours = h;
            const minutes = m;

            // Convert to 24-hour format
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const arrivalTime = new Date(date);
            arrivalTime.setHours(hours, minutes, 0, 0);

            const reservationData = {
                restaurantId: restaurant.id,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                arrival_time: arrivalTime.toISOString(),
                party_size: parseInt(partySize, 10),
                special_requests: notes,
                preferred_area: area !== "none" ? area : undefined,
                payment_method: paymentMethod,
                deposit_amount: depositAmount,
                applied_deposit_rule: appliedRule
            };

            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            const result = await response.json();

            if (result.success) {
                alert('Reservation created successfully!');
                // Close dialog or reset form
                window.location.reload(); // Or handle success differently
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Reservation error:', error);
            alert('Failed to create reservation');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!restaurant || isLoading) return <LoadingUI text="Loading..." />;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-main-green text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-main-green/80 transition">
                    <Plus className="w-4 h-4" />
                    New Reservation
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New Reservation</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    {/* Date / Time / Party Size */}
                    <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
                        {/* Date */}
                        <div className="flex flex-col">
                            <Label className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4" />
                                Date
                            </Label>
                            <Input
                                type="date"
                                value={date ? date.toISOString().split("T")[0] : ""}
                                onChange={(e) => {
                                    const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
                                    setDate(selectedDate);
                                    // Reset time when date changes
                                    setSelectedTime("");
                                }}
                                required
                            />

                            {date && (
                                openTimes.closed ? (
                                    <p className="text-red-500 text-xs mt-1">
                                        Restaurant is closed on this day.
                                    </p>
                                ) : (
                                    openTimes.open && openTimes.close && (
                                        <p className="text-green-600 text-xs mt-1">
                                            Open from {openTimes.open} till {openTimes.close}
                                        </p>
                                    )
                                )
                            )}
                        </div>

                        {/* Time */}
                        <div className="flex flex-col gap-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time
                            </Label>
                            <Select
                                value={selectedTime}
                                onValueChange={setSelectedTime}
                                disabled={!date || openTimes.closed}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            !date
                                                ? "Select date first"
                                                : openTimes.closed
                                                    ? "Closed"
                                                    : "Select time"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTimeSlots.map((slot) => (
                                        <SelectItem key={slot.value} value={slot.value}>
                                            {slot.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>



                            {/* Time Override Warning (when specific time is blocked) */}
                            {isTimeBlocked && activeOverride && (
                                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md mt-1">
                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-red-700 text-xs font-medium">
                                            This time slot is unavailable
                                        </p>
                                        <div className="text-red-600 text-xs">
                                            <p>
                                                <strong>Blocked period:</strong> {activeOverride.startTime} to {activeOverride.endTime}
                                            </p>
                                            {activeOverride.reason && (
                                                <p>
                                                    <strong>Reason:</strong> {activeOverride.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No Available Times Message */}
                            {date && !openTimes.closed && availableTimeSlots.length === 0 && (
                                <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md mt-1">
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-amber-700 text-xs font-medium">
                                            No available time slots
                                        </p>
                                        <div className="text-amber-600 text-xs">
                                            <p>All time slots are currently blocked for this date.</p>
                                            {dateOverrides.length > 0 && (
                                                <div className="mt-1">
                                                    <p><strong>Blocked periods:</strong></p>
                                                    <ul className="list-disc list-inside">
                                                        {dateOverrides.map(override => (
                                                            <li key={override.id}>
                                                                {override.startTime} - {override.endTime}
                                                                {override.reason && ` (${override.reason})`}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <p className="mt-1">Please select a different date.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Date Override Info (when date is selected but no time yet) */}
                        {date && !selectedTime && hasDateOverrides && (
                            <div className="col-span-2 mt-2 rounded-lg border border-blue-200 bg-blue-50/70 shadow-sm">
                                <div className="flex items-start gap-3 p-3">
                                    <div className="mt-0.5">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-medium text-blue-700">
                                            Some time slots are currently blocked
                                        </p>

                                        <div className="space-y-2">
                                            {dateOverrides.map((override, index) => (
                                                <div
                                                    key={override.id}
                                                    className="rounded-md bg-white/80 p-2 border border-blue-100 text-xs text-blue-700 shadow-sm"
                                                >
                                                    <div className="flex justify-between flex-col items-start gap-1">
                                                        <span className="font-semibold">
                                                            ⏰ {override.startTime} - {override.endTime}
                                                        </span>
                                                        {override.reason && (
                                                            <span className="text-sm italic text-blue-500">
                                                                {override.reason}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {index < dateOverrides.length - 1 && (
                                                        <div className="border-t border-blue-100 mt-2" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Party Size / Area */}
                    <div className="grid gap-4 sm:grid-cols-2 mt-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Users className="h-4 w-4" /> Party Size
                            </Label>
                            <Select value={partySize} onValueChange={setPartySize} required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {i + 1} {i === 0 ? 'person' : 'people'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Preferred Area (optional)
                            </Label>
                            <Select value={area} onValueChange={setArea}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="No preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No preference</SelectItem>
                                    {areas
                                        ?.filter((a) => a.active)
                                        .map((a) => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Enhanced Deposit Information */}
                    {depositAmount > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-amber-800">
                                    Deposit Required
                                </span>
                                <span className="text-sm font-bold text-amber-900">
                                    {depositAmount} {settings?.deposit_settings?.depositCurrency || 'EUR'}
                                </span>
                            </div>
                            {appliedRule && (
                                <p className="text-xs text-amber-700 mt-1">
                                    {getRuleDescription(appliedRule)}
                                </p>
                            )}
                            {!appliedRule && (
                                <p className="text-xs text-amber-700 mt-1">
                                    {settings?.deposit_settings?.depositType === 'per-person'
                                        ? `€${parseFloat(settings.deposit_settings.depositAmount || '0')} per person`
                                        : 'Flat rate deposit'
                                    }
                                </p>
                            )}
                        </div>
                    )}

                    <Separator className="my-4" />

                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Customer Information</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Special Requests</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Allergies, preferences, celebrations, etc."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Payment Method */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Payment Method</h3>
                        <div className="grid gap-3">
                            {/* Card Payment */}
                            <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition
      ${paymentMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400"}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="card"
                                    checked={paymentMethod === "card"}
                                    onChange={(e) => setPaymentMethod(e.target.value as "card")}
                                    className="text-blue-600"
                                />
                                <CreditCard className="h-5 w-5 text-gray-600" />
                                <div className="flex-1">
                                    <div className="font-medium">Paid by Card</div>
                                    <div className="text-sm text-gray-500">Customer paid using credit or debit card.</div>
                                </div>
                            </label>

                            {/* Cash Payment */}
                            <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition
      ${paymentMethod === "cash" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400"}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cash"
                                    checked={paymentMethod === "cash"}
                                    onChange={(e) => setPaymentMethod(e.target.value as "cash")}
                                    className="text-blue-600"
                                />
                                <DollarSign className="h-5 w-5 text-gray-600" />
                                <div className="flex-1">
                                    <div className="font-medium">Paid by Cash</div>
                                    <div className="text-sm text-gray-500">Customer paid in cash at the restaurant.</div>
                                </div>
                            </label>
                        </div>

                        {/* Cancellation Policy */}
                        {
                            settings &&
                            <>
                                {settings?.deposit_settings?.cancellationPolicies?.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Cancellation Policy</h4>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            {settings.deposit_settings.cancellationPolicies
                                                .filter((policy: any) => policy.active)
                                                .map((policy: any) => (
                                                    <li key={policy.id}>
                                                        Cancel within {policy.hoursBefore} hours for {policy.refundPercentage}% refund
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        }
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !date || !selectedTime || !name || !email || isTimeBlocked}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </span>
                            ) : isTimeBlocked ? (
                                "Time Slot Blocked"
                            ) : (
                                `Create Reservation${depositAmount > 0 && paymentMethod === 'card' ? ' & Pay Deposit' : ''}`
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Helper function to generate rule descriptions
function getRuleDescription(rule: DynamicRule): string {
    const amount = parseFloat(rule.amount);

    switch (rule.ruleType) {
        case 'special-date':
            return `Special date rate: ${rule.depositType === 'per-person' ? `€${amount} per person` : `€${amount} flat rate`}`;

        case 'time-slot':
            return `Time slot rate (${rule.startTime}-${rule.endTime}): ${rule.depositType === 'per-person' ? `€${amount} per person` : `€${amount} flat rate`}`;

        case 'party-size':
            return `Party size rate (${rule.minPartySize}-${rule.maxPartySize} people): ${rule.depositType === 'per-person' ? `€${amount} per person` : `€${amount} flat rate`}`;

        case 'day-of-week':
            const daysMap: { [key: string]: string } = {
                '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
                '4': 'Thursday', '5': 'Friday', '6': 'Saturday'
            };
            const dayNames = rule.days?.split(',').map(d => daysMap[d.trim()]).join(', ') || '';
            return `${dayNames} rate: ${rule.depositType === 'per-person' ? `€${amount} per person` : `€${amount} flat rate`}`;

        default:
            return `${rule.depositType === 'per-person' ? `€${amount} per person` : `€${amount} flat rate`}`;
    }
}

export default NewReservationForm;