"use client"
import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface OpeningHoursData {
    [key: string]: {
        open: string
        close: string
        closed: boolean
    }
}

interface OpeningHoursStatusProps {
    openingHours: OpeningHoursData
    className?: string
    accentColor?: string
    color: string
    onClick?: () => void
}

export function OpeningHoursStatus({
    openingHours,
    className = "",
    accentColor = "#0f766e",
    color,
    onClick,
}: OpeningHoursStatusProps) {
    const [status, setStatus] = useState<"open" | "closed" | "closing-soon" | "opening-soon">("open")
    const [nextChange, setNextChange] = useState<string>("Until 10:00 PM")

    useEffect(() => {
        function parseTimeString(timeStr: string): { hours: number; minutes: number } {
            const [time, period] = timeStr.trim().split(" ")
            const [hours, minutes] = time.split(":")
            let hour = Number.parseInt(hours)

            if (period?.toLowerCase() === "pm" && hour !== 12) {
                hour += 12
            } else if (period?.toLowerCase() === "am" && hour === 12) {
                hour = 0
            }

            return {
                hours: hour,
                minutes: Number.parseInt(minutes) || 0,
            }
        }

        function updateStatus() {
            const now = new Date()
            const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
            const today = days[now.getDay()]

            const todaySchedule = openingHours[today]

            if (!todaySchedule || todaySchedule.closed || !todaySchedule.open || !todaySchedule.close) {
                setStatus("closed")
                setNextChange("Closed today")
                return
            }

            const openTime = parseTimeString(todaySchedule.open)
            const closeTime = parseTimeString(todaySchedule.close)

            const openDate = new Date(now)
            openDate.setHours(openTime.hours, openTime.minutes, 0, 0)

            const closeDate = new Date(now)
            closeDate.setHours(closeTime.hours, closeTime.minutes, 0, 0)

            // Handle overnight hours (close time is next day)
            if (closeTime.hours < openTime.hours) {
                closeDate.setDate(closeDate.getDate() + 1)
            }

            if (now >= openDate && now < closeDate) {
                const minutesToClose = Math.round((closeDate.getTime() - now.getTime()) / 1000 / 60)
                setStatus(minutesToClose <= 60 ? "closing-soon" : "open")
                setNextChange(`Until ${closeDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)
            } else if (now < openDate) {
                const minutesToOpen = Math.round((openDate.getTime() - now.getTime()) / 1000 / 60)
                setStatus(minutesToOpen <= 60 ? "opening-soon" : "closed")
                setNextChange(`Opens ${openDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)
            } else {
                // Find next opening day
                let nextDay = (now.getDay() + 1) % 7
                let daysAhead = 1

                while (daysAhead <= 7) {
                    const dayName = days[nextDay]
                    const nextDaySchedule = openingHours[dayName]

                    if (nextDaySchedule && !nextDaySchedule.closed && nextDaySchedule.open) {
                        if (daysAhead === 1) {
                            setNextChange("Opens tomorrow")
                        } else {
                            const nextDate = new Date(now)
                            nextDate.setDate(nextDate.getDate() + daysAhead)
                            setNextChange(`Opens ${nextDate.toLocaleDateString("en-US", { weekday: "long" })}`)
                        }
                        break
                    }

                    nextDay = (nextDay + 1) % 7
                    daysAhead++
                }

                if (daysAhead > 7) {
                    setNextChange("Closed")
                }

                setStatus("closed")
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
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105 ${className} ${onClick ? "cursor-pointer" : ""}`}
            style={{ backgroundColor: getStatusBgColor() }}
            onClick={onClick}
        >
            <Clock className="h-4 w-4" style={{ color: getStatusColor() }} />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
                    {status === "open" && "Open"}
                    {status === "closed" && "Closed"}
                    {status === "closing-soon" && "Closing Soon"}
                    {status === "opening-soon" && "Opening Soon"}
                </span>
                {nextChange && <span style={{
                    color
                }} className="text-sm opacity-90">• {nextChange}</span>}
            </div>
        </div>
    )
}
