import { DateTime } from "luxon";

export function getUTCFromLocalDateTime(
    dateISO: string,
    selectedTime: string,
    timezone: string = "Europe/Rome"
): string {
    const dateOnly = dateISO.split("T")[0]; // "2025-11-13"
    const combined = `${dateOnly} ${selectedTime}`; // "2025-11-13 06:00 AM"
    const localDateTime = DateTime.fromFormat(combined, "yyyy-MM-dd hh:mm a", { zone: timezone });
    if (!localDateTime.isValid) {
        throw new Error(`Invalid date or time format: ${combined}`);
    }
    return localDateTime.toUTC().toISO()!;
}

