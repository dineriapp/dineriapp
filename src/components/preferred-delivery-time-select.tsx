"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

    label?: string;
    note?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

function roundUpToNext5(date: Date, step = 5) {
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

export function generateTimeSlots(
    now: Date,
    minutesAhead: number,
    stepMinutes: number,
    timeZone: string
): Slot[] {
    const start = roundUpToNext5(now, stepMinutes);
    const slots: Slot[] = [];
    const steps = Math.floor(minutesAhead / stepMinutes);

    for (let i = 0; i <= steps; i++) {
        const t = new Date(start.getTime() + i * stepMinutes * 60_000);
        slots.push({
            value: t.toISOString(),
            label: format12h(t, timeZone)
        });
    }
    return slots;
}

export default function PreferredDeliveryTimeSelect({
    value,
    defaultValue,
    onChange,
    minutesAhead = 120,
    stepMinutes = 5,
    timeZone,
    startAt,
    label = "Preferred delivery time",
    note = "This is a preferred time and is not final. We’ll do our best to deliver around this time.",
    placeholder = "Select a time within the next 2 hours",
    disabled,
    className,
}: PreferredDeliveryTimeProps) {
    const userTimeZone =
        timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const slots = useMemo(
        () => generateTimeSlots(startAt ?? new Date(), minutesAhead, stepMinutes, userTimeZone),
        [startAt, minutesAhead, stepMinutes, userTimeZone]
    );

    const [internal, setInternal] = useState<string>(defaultValue ?? "");

    const selectedISO = value ?? internal;

    useEffect(() => {
        if (!selectedISO && slots.length) {
            const first = slots[0].value;
            if (value === undefined) setInternal(first);
            onChange?.({
                iso: slots[5].value,
                label: slots[5].label,
                timeZone: userTimeZone,
                date: new Date(slots[5].value),
            });
        }
    }, [selectedISO, slots, value, onChange, userTimeZone]);

    const handleChange = (nextISO: string) => {
        if (value === undefined) setInternal(nextISO);

        const slot = slots.find(s => s.value === nextISO);
        const label = slot ? slot.label : format12h(new Date(nextISO), userTimeZone);

        onChange?.({
            iso: nextISO,
            label,
            timeZone: userTimeZone,
            date: new Date(nextISO),
        });
    };

    return (
        <div className={cn?.("space-y-2", className) || "space-y-2"}>
            <div>
                <Label className="text-base">{label}</Label>
                <p className="text-xs text-muted-foreground">
                    Shown in timezone:&nbsp;
                    <span className="font-medium">{userTimeZone}</span> (12-hour format)
                </p>
            </div>

            <Select
                value={selectedISO}
                onValueChange={handleChange}
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
