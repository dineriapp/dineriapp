"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getRestaurantStatusWithClientView } from "@/hooks/isRestaurantOpenNow";
import { OpeningHoursData } from "@/types";
import { useTranslations } from "next-intl";

type StatusType = "open" | "closing-soon" | "opening-soon" | "closed";

interface OpeningHoursStatusProps {
    openingHours: OpeningHoursData;
    className?: string;
    accentColor?: string;
    restaurentTimeZone?: string;
    color: string;
    pop?: boolean;
    onClick?: () => void;
    // per‑state custom colours
    openTextColor?: string;
    openBgColor?: string;
    closedTextColor?: string;
    closedBgColor?: string;
}

export function OpeningHoursStatus({
    openingHours,
    className = "",
    accentColor = "#0f766e",
    restaurentTimeZone,
    color,
    pop = false,
    onClick,
    openTextColor,
    openBgColor,
    closedTextColor,
    closedBgColor,
}: OpeningHoursStatusProps) {
    const t = useTranslations("opening_hours_status");
    const s = useTranslations("time");
    const [status, setStatus] = useState<ReturnType<typeof getRestaurantStatusWithClientView> | null>(null);

    useEffect(() => {
        const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const updateStatus = () => {
            if (restaurentTimeZone && openingHours) {
                const result = getRestaurantStatusWithClientView(restaurentTimeZone, openingHours, clientTz);
                setStatus(result);
            }
        };
        updateStatus();
        const interval = setInterval(updateStatus, 60000);
        return () => clearInterval(interval);
    }, [openingHours, restaurentTimeZone]);

    if (!status || !restaurentTimeZone) return null;

    const isClosingSoon = status.isOpen && status.timeUntilClose?.includes("minute");
    const isOpeningSoon = !status.isOpen && status.timeUntilOpen?.includes("minute");

    const statusType: StatusType = status.isOpen
        ? isClosingSoon
            ? "closing-soon"
            : "open"
        : isOpeningSoon
            ? "opening-soon"
            : "closed";

    // Helper to get custom or default colours for the current state
    const getStateStyles = (): { textColor: string; bgColor: string } => {
        const defaults: Record<StatusType, { textColor: string; bgColor: string }> = {
            open: {
                textColor: accentColor,
                bgColor: `${accentColor}20`,
            },
            "closing-soon": {
                textColor: "#f97316",
                bgColor: "#f9731620",
            },
            "opening-soon": {
                textColor: "#10b981",
                bgColor: "#10b98120",
            },
            closed: {
                textColor: "#ef4444",
                bgColor: "#ef444420",
            },
        };

        const overrides = {
            open: { textColor: openTextColor, bgColor: openBgColor },
            "closing-soon": { textColor: closedTextColor, bgColor: closedBgColor },
            "opening-soon": { textColor: openTextColor, bgColor: openBgColor },
            closed: { textColor: closedTextColor, bgColor: closedBgColor },
        };

        const override = overrides[statusType];
        const def = defaults[statusType];
        return {
            textColor: override.textColor ?? def.textColor,
            bgColor: override.bgColor ?? def.bgColor,
        };
    };

    const { textColor: stateTextColor, bgColor: stateBgColor } = getStateStyles();

    const statusLabel = {
        open: t("status.open"),
        closed: t("status.closed"),
        "closing-soon": t("status.closing_soon"),
        "opening-soon": t("status.opening_soon"),
    }[statusType];

    const nextChange = status.isOpen
        ? s("closes_at", { time: status.closingTime })
        : status.openingTime
            ? status.nextOpeningDay
                ? s("opens_at_with_day", { day: status.nextOpeningDay, time: status.openingTime })
                : s("opens_at", { time: status.openingTime })
            : t("closed_fallback");

    // Pop mode (simple row, no background)
    if (pop) {
        return (
            <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" style={{ color: stateTextColor }} />
                <span className="text-sm" style={{ color }}>
                    {statusLabel}
                </span>
            </div>
        );
    }

    // Main mode (with background and extra info)
    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105 ${className} ${onClick ? "cursor-pointer" : ""}`}
            style={{ backgroundColor: stateBgColor }}
            onClick={onClick}
        >
            <Clock className="h-4 w-4" style={{ color: stateTextColor }} />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: stateTextColor }}>
                    {statusLabel}
                </span>
                <span className="text-sm line-clamp-1" style={{ color: stateTextColor }}>
                    • {nextChange}
                </span>
            </div>
        </div>
    );
}

// "use client"

// import { Clock } from "lucide-react"
// import { useEffect, useState } from "react"
// import { getRestaurantStatusWithClientView } from "@/hooks/isRestaurantOpenNow"
// import { OpeningHoursData } from "@/types"
// import { useTranslations } from "next-intl"


// interface OpeningHoursStatusProps {
//     openingHours: OpeningHoursData
//     className?: string
//     accentColor?: string
//     restaurentTimeZone?: string
//     color: string
//     pop?: boolean
//     onClick?: () => void
// }

// export function OpeningHoursStatus({
//     openingHours,
//     className = "",
//     accentColor = "#0f766e",
//     restaurentTimeZone,
//     color,
//     pop = false,
//     onClick,
// }: OpeningHoursStatusProps) {
//     const t = useTranslations("opening_hours_status")
//     const s = useTranslations("time")
//     const [status, setStatus] = useState<ReturnType<typeof getRestaurantStatusWithClientView> | null>(null)
//     useEffect(() => {
//         const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone

//         const updateStatus = () => {
//             if (restaurentTimeZone && openingHours) {
//                 const result = getRestaurantStatusWithClientView(restaurentTimeZone, openingHours, clientTz)
//                 setStatus(result)
//             }
//         }

//         updateStatus()
//         const interval = setInterval(updateStatus, 60000)
//         return () => clearInterval(interval)
//     }, [openingHours, restaurentTimeZone])

//     if (!status) return null

//     if (!restaurentTimeZone) return null

//     const isClosingSoon = status.isOpen && status.timeUntilClose?.includes("minute")
//     const isOpeningSoon = !status.isOpen && status.timeUntilOpen?.includes("minute")

//     const statusType = status.isOpen
//         ? isClosingSoon
//             ? "closing-soon"
//             : "open"
//         : isOpeningSoon
//             ? "opening-soon"
//             : "closed"

//     const getStatusColor = () => {
//         switch (statusType) {
//             case "open":
//                 return accentColor
//             case "closing-soon":
//                 return "#f97316"
//             case "opening-soon":
//                 return "#10b981"
//             default:
//                 return "#ef4444"
//         }
//     }

//     const getStatusBgColor = () => `${getStatusColor()}20`

//     const statusLabel = {
//         open: t("status.open"),
//         closed: t("status.closed"),
//         "closing-soon": t("status.closing_soon"),
//         "opening-soon": t("status.opening_soon"),
//     }[statusType]

//     const nextChange = status.isOpen
//         ? s("closes_at", { time: status.closingTime })
//         : status.openingTime
//             ? status.nextOpeningDay
//                 ? s("opens_at_with_day", { day: status.nextOpeningDay, time: status.openingTime })
//                 : s("opens_at", { time: status.openingTime })
//             : t("closed_fallback")



//     return pop ? (
//         <div className="flex items-center justify-center gap-2">
//             <Clock className="h-4 w-4" style={{ color: accentColor }} />
//             <span className="text-sm" style={{ color }}>
//                 {statusLabel}
//             </span>
//         </div>
//     ) : (
//         <div
//             className={`inline-flex items-center gap-2   px-3 py-1.5 rounded-full transition-all hover:scale-105 ${className} ${onClick ? "cursor-pointer" : ""
//                 }`}
//             style={{ backgroundColor: getStatusBgColor() }}
//             onClick={onClick}
//         >
//             <Clock className="h-4 w-4" style={{ color: getStatusColor() }} />
//             <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
//                     {statusLabel}
//                 </span>
//                 <span className="text-sm opacity-90 line-clamp-1" style={{ color }}>
//                     • {nextChange}
//                 </span>
//             </div>
//         </div>
//     )
// }
