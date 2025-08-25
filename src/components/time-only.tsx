"use client";

import { useMemo } from "react";

export interface TimeOnlyProps {
    iso: string | null | undefined;
    timeZone: string;
    locale?: string;
    compactAmPm?: boolean;
    fallback?: string;
    className?: string;
}

function formatTimeOnly(
    iso: string,
    timeZone: string,
    locale = "en-US",
    compactAmPm = true
) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;

    const raw = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
    }).format(d);

    // Make "9:00 PM" -> "9:00PM" if compactAmPm=true
    return compactAmPm ? raw.replace(/\s(AM|PM)$/i, "$1") : raw;
}

export default function TimeOnly({
    iso,
    timeZone,
    locale = "en-US",
    compactAmPm = true,
    fallback = "—",
    className,
}: TimeOnlyProps) {
    const txt = useMemo(() => {
        if (!iso || !timeZone) return null;
        return formatTimeOnly(iso, timeZone, locale, compactAmPm);
    }, [iso, timeZone, locale, compactAmPm]);

    return <span className={className}>{txt ?? fallback}</span>;
}
