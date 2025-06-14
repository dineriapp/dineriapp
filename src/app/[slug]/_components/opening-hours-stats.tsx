"use client"
import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface OpeningHours {
    day: string
    hours: string
}

interface OpeningHoursStatusProps {
    openingHours: OpeningHours[]
    className?: string
    accentColor?: string
}

interface ParsedHours {
    open: Date
    close: Date
}

export function OpeningHoursStatus({ openingHours, className = "", accentColor = "#0f766e" }: OpeningHoursStatusProps) {
    const [status, setStatus] = useState<"open" | "closed" | "closing-soon" | "opening-soon">("open")
    const [nextChange, setNextChange] = useState<string>("Until 10:00 PM")

    useEffect(() => {
        function parseTimeString(timeStr: string, baseDate: Date): Date {
            const [time, period] = timeStr.trim().split(" ")
            const [hours, minutes] = time.split(":")
            let hour = Number.parseInt(hours)

            if (period?.toLowerCase() === "pm" && hour !== 12) {
                hour += 12
            } else if (period?.toLowerCase() === "am" && hour === 12) {
                hour = 0
            }

            const date = new Date(baseDate)
            date.setHours(hour)
            date.setMinutes(Number.parseInt(minutes) || 0)
            date.setSeconds(0)
            date.setMilliseconds(0)

            return date
        }

        function parseHours(hoursStr: string, baseDate: Date): ParsedHours | null {
            if (!hoursStr || hoursStr.toLowerCase() === "closed") return null

            const [openStr, closeStr] = hoursStr.split("-")
            if (!openStr || !closeStr) return null

            return {
                open: parseTimeString(openStr, baseDate),
                close: parseTimeString(closeStr, baseDate),
            }
        }

        function updateStatus() {
            const now = new Date()
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const today = days[now.getDay()]

            const todaySchedule = openingHours.find((h) => h.day === today)
            const todayHours = todaySchedule ? parseHours(todaySchedule.hours, now) : null

            if (todayHours) {
                if (now >= todayHours.open && now < todayHours.close) {
                    const minutesToClose = Math.round((todayHours.close.getTime() - now.getTime()) / 1000 / 60)
                    setStatus(minutesToClose <= 60 ? "closing-soon" : "open")
                    setNextChange(`Until ${todayHours.close.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)
                } else if (now < todayHours.open) {
                    const minutesToOpen = Math.round((todayHours.open.getTime() - now.getTime()) / 1000 / 60)
                    setStatus(minutesToOpen <= 60 ? "opening-soon" : "closed")
                    setNextChange(`Opens ${todayHours.open.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)
                } else {
                    setStatus("closed")
                    setNextChange("Opens tomorrow")
                }
            } else {
                setStatus("closed")
                setNextChange("Closed today")
            }
        }

        updateStatus()
        const interval = setInterval(updateStatus, 60000)
        return () => clearInterval(interval)
    }, [openingHours])

    const getStatusColor = () => {
        switch (status) {
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

    const getStatusBgColor = () => {
        switch (status) {
            case "open":
                return `${accentColor}20`
            case "closing-soon":
                return "#f9731620"
            case "opening-soon":
                return "#10b98120"
            default:
                return "#ef444420"
        }
    }

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${className}`}
            style={{ backgroundColor: getStatusBgColor() }}
        >
            <Clock className="h-4 w-4" style={{ color: getStatusColor() }} />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
                    {status === "open" && "Open"}
                    {status === "closed" && "Closed"}
                    {status === "closing-soon" && "Closing Soon"}
                    {status === "opening-soon" && "Opening Soon"}
                </span>
                {nextChange && <span className="text-sm opacity-90">• {nextChange}</span>}
            </div>
        </div>
    )
}
