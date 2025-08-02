"use client"

import { Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { getRestaurantStatusWithClientView } from "@/hooks/isRestaurantOpenNow"
import { OpeningHoursData } from "@/types"


interface OpeningHoursStatusProps {
    openingHours: OpeningHoursData
    className?: string
    accentColor?: string
    restaurentTimeZone?: string
    color: string
    pop?: boolean
    onClick?: () => void
}

export function OpeningHoursStatus({
    openingHours,
    className = "",
    accentColor = "#0f766e",
    restaurentTimeZone,
    color,
    pop = false,
    onClick,
}: OpeningHoursStatusProps) {
    const [status, setStatus] = useState<ReturnType<typeof getRestaurantStatusWithClientView> | null>(null)
    useEffect(() => {
        const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone

        const updateStatus = () => {
            if (restaurentTimeZone && openingHours) {
                const result = getRestaurantStatusWithClientView(restaurentTimeZone, openingHours, clientTz)
                setStatus(result)
            }
        }

        updateStatus()
        const interval = setInterval(updateStatus, 60000)
        return () => clearInterval(interval)
    }, [openingHours, restaurentTimeZone])

    if (!status) return null

    if (!restaurentTimeZone) return null

    const isClosingSoon = status.isOpen && status.timeUntilClose?.includes("minute")
    const isOpeningSoon = !status.isOpen && status.timeUntilOpen?.includes("minute")

    const statusType = status.isOpen
        ? isClosingSoon
            ? "closing-soon"
            : "open"
        : isOpeningSoon
            ? "opening-soon"
            : "closed"

    const getStatusColor = () => {
        switch (statusType) {
            case "open":
                return accentColor
            case "closing-soon":
                return "#f97316"
            case "opening-soon":
                return "#10b981"
            default:
                return "#ef4444"
        }
    }

    const getStatusBgColor = () => `${getStatusColor()}20`

    const statusLabel = {
        open: "Open",
        closed: "Closed",
        "closing-soon": "Closing Soon",
        "opening-soon": "Opening Soon",
    }[statusType]

    const nextChange = status.isOpen
        ? `Until ${status.closingTime}`
        : status.timeUntilOpen
            ? `Opens in ${status.timeUntilOpen}${status.nextOpeningDay ? ` (${status.nextOpeningDay})` : ""}`
            : "Closed"

    return pop ? (
        <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" style={{ color: accentColor }} />
            <span className="text-sm" style={{ color }}>
                {statusLabel}
            </span>
        </div>
    ) : (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105 ${className} ${onClick ? "cursor-pointer" : ""
                }`}
            style={{ backgroundColor: getStatusBgColor() }}
            onClick={onClick}
        >
            <Clock className="h-4 w-4" style={{ color: getStatusColor() }} />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
                    {statusLabel}
                </span>
                <span className="text-sm opacity-90" style={{ color }}>
                    • {nextChange}
                </span>
            </div>
        </div>
    )
}
