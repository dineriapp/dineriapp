"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slot = {
    value: string;
    label: string;
};

export type PreferredDeliveryTimeChange = {
    iso: string;
    label: string;
    timeZone: string;
    date: Date;
};

export interface PreferredDeliveryTimeProps {
    value?: string;
    defaultValue?: string;
    onChange?: (next: PreferredDeliveryTimeChange) => void;

    minutesAhead?: number;
    stepMinutes?: number;
    timeZone?: string;
    startAt?: Date;

    enableDatePicker?: boolean;
    minDate?: Date;

    label?: string;
    note?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

function roundUpToNext5(date: Date, step: number) {
    const d = new Date(date);
    const ms = 1000 * 60 * step;
    return new Date(Math.ceil(d.getTime() / ms) * ms);
}

function format12h(d: Date, timeZone: string) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone,
    }).format(d);
}

function generateTimeSlots(
    baseDateTime: Date,
    minutesAhead: number,
    stepMinutes: number,
    timeZone: string
): Slot[] {
    const start = roundUpToNext5(baseDateTime, stepMinutes);
    const slots: Slot[] = [];
    const steps = Math.floor(minutesAhead / stepMinutes);

    for (let i = 0; i <= steps; i++) {
        const t = new Date(start.getTime() + i * stepMinutes * 60_000);
        slots.push({
            value: t.toISOString(),
            label: format12h(t, timeZone),
        });
    }
    return slots;
}

function getLocalTimeComponents(date: Date): { hour: number; minute: number; second: number } {
    return {
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
    };
}

function combineDateAndLocalTime(dateOnly: Date, time: { hour: number; minute: number; second: number }): Date {
    return new Date(
        dateOnly.getFullYear(),
        dateOnly.getMonth(),
        dateOnly.getDate(),
        time.hour,
        time.minute,
        time.second
    );
}

export default function PreferredDeliveryTimeSelect({
    value,
    defaultValue,
    onChange,
    minutesAhead = 120,
    stepMinutes = 5,
    timeZone,
    startAt,
    enableDatePicker = true,
    minDate,
    label = "Preferred delivery time",
    note = "This is a preferred time and is not final. We’ll do our best to deliver around this time.",
    placeholder = "Select a time within the next 2 hours",
    disabled,
    className,
}: PreferredDeliveryTimeProps) {
    const userTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const isControlled = value !== undefined;

    // Reference time‑of‑day (wall clock) used for slot generation on any date
    const referenceTime = useMemo(() => {
        const ref = startAt ?? new Date();
        return getLocalTimeComponents(ref);
    }, [startAt]);

    // ------------------------------------------------------------------
    // Main state: the selected ISO datetime string
    // ------------------------------------------------------------------
    const [internalISO, setInternalISO] = useState<string>(() => {
        if (defaultValue) return defaultValue;
        return "";
    });

    const selectedISO = isControlled ? value : internalISO;

    // ------------------------------------------------------------------
    // Derive selected date (for calendar) from selectedISO
    // ------------------------------------------------------------------
    const selectedDate = useMemo(() => {
        if (selectedISO) {
            const d = new Date(selectedISO);
            if (!isNaN(d.getTime())) return d;
        }
        return new Date();
    }, [selectedISO]);

    // ------------------------------------------------------------------
    // Generate slots for the selected date
    // ------------------------------------------------------------------
    const slots = useMemo(() => {
        const baseDateTime = combineDateAndLocalTime(selectedDate, referenceTime);
        return generateTimeSlots(baseDateTime, minutesAhead, stepMinutes, userTimeZone);
    }, [selectedDate, referenceTime, minutesAhead, stepMinutes, userTimeZone]);

    // ------------------------------------------------------------------
    // Helper: find the best slot for a given date (usually first)
    // Returns the full slot object or null if none
    // ------------------------------------------------------------------
    const getDefaultSlotForDate = useCallback((date: Date): Slot | null => {
        const baseDateTime = combineDateAndLocalTime(date, referenceTime);
        const tempSlots = generateTimeSlots(baseDateTime, minutesAhead, stepMinutes, userTimeZone);
        return tempSlots.length > 0 ? tempSlots[0] : null;
    }, [referenceTime, minutesAhead, stepMinutes, userTimeZone]);

    // ------------------------------------------------------------------
    // Auto‑select a slot when component mounts with no value/defaultValue
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!isControlled && !internalISO && slots.length > 0) {
            const firstSlot = slots[0];
            setInternalISO(firstSlot.value);
            onChange?.({
                iso: firstSlot.value,
                label: firstSlot.label,
                timeZone: userTimeZone,
                date: new Date(firstSlot.value),
            });
        }
    }, [slots, isControlled, internalISO, onChange, userTimeZone]);

    // ------------------------------------------------------------------
    // When the selected date changes (either from calendar or external value),
    // ensure we have a valid slot for that date.
    // This runs only when selectedDate changes, not on every render.
    // ------------------------------------------------------------------
    const lastNotifiedISO = useRef<string | undefined>(selectedISO);
    useEffect(() => {
        if (!selectedISO) {
            // No selection yet – try to pick a default slot
            const defaultSlot = getDefaultSlotForDate(selectedDate);
            if (defaultSlot && !isControlled) {
                setInternalISO(defaultSlot.value);
                onChange?.({
                    iso: defaultSlot.value,
                    label: defaultSlot.label,
                    timeZone: userTimeZone,
                    date: new Date(defaultSlot.value),
                });
            }
            return;
        }

        // Check if the currently selected ISO is valid for the current selectedDate
        const isValid = slots.some(slot => slot.value === selectedISO);
        if (!isValid && slots.length > 0) {
            // Current selection is invalid for this date – select the first slot
            const firstSlot = slots[0];
            if (!isControlled) {
                setInternalISO(firstSlot.value);
            }
            // Only call onChange if the new value differs from the last notified one
            if (firstSlot.value !== lastNotifiedISO.current) {
                lastNotifiedISO.current = firstSlot.value;
                onChange?.({
                    iso: firstSlot.value,
                    label: firstSlot.label,
                    timeZone: userTimeZone,
                    date: new Date(firstSlot.value),
                });
            }
        } else if (selectedISO && selectedISO !== lastNotifiedISO.current) {
            // Valid selection that has changed (e.g., user picked a time)
            const slot = slots.find(s => s.value === selectedISO);
            if (slot) {
                lastNotifiedISO.current = selectedISO;
                onChange?.({
                    iso: selectedISO,
                    label: slot.label,
                    timeZone: userTimeZone,
                    date: new Date(selectedISO),
                });
            }
        }
    }, [selectedDate, selectedISO, slots, isControlled, getDefaultSlotForDate, onChange, userTimeZone]);

    // ------------------------------------------------------------------
    // Handlers
    // ------------------------------------------------------------------
    const handleDateChange = (newDate: Date | undefined) => {
        if (!newDate) return;
        // Find the first valid slot for the new date
        const defaultSlot = getDefaultSlotForDate(newDate);
        if (defaultSlot) {
            if (!isControlled) {
                setInternalISO(defaultSlot.value);
            }
            // The effect above will call onChange, but we also call it here immediately
            // to avoid waiting for the effect.
            if (defaultSlot.value !== lastNotifiedISO.current) {
                lastNotifiedISO.current = defaultSlot.value;
                onChange?.({
                    iso: defaultSlot.value,
                    label: defaultSlot.label,
                    timeZone: userTimeZone,
                    date: new Date(defaultSlot.value),
                });
            }
        }
    };

    const handleTimeChange = (nextISO: string) => {
        if (!isControlled) {
            setInternalISO(nextISO);
        }
        const slot = slots.find(s => s.value === nextISO);
        if (slot && nextISO !== lastNotifiedISO.current) {
            lastNotifiedISO.current = nextISO;
            onChange?.({
                iso: nextISO,
                label: slot.label,
                timeZone: userTimeZone,
                date: new Date(nextISO),
            });
        }
    };

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
        <div className={cn("space-y-2", className)}>
            <div>
                <Label className="text-base">{label}</Label>
                <p className="text-xs text-muted-foreground">
                    Shown in timezone:&nbsp;
                    <span className="font-medium">{userTimeZone}</span> (12-hour format)
                </p>
            </div>

            {enableDatePicker && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                            disabled={disabled}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateChange}
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const min = minDate ?? today;
                                return date < min;
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            )}

            <Select
                value={selectedISO || undefined}
                onValueChange={handleTimeChange}
                disabled={disabled || slots.length === 0}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                    {slots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {note && <p className="text-xs text-amber-600">{note}</p>}
        </div>
    );
}