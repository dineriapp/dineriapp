import { useEffect, useState } from "react"
import { DateTime, Duration } from "luxon"
import { getRestaurantStatusWithClientView } from "@/hooks/isRestaurantOpenNow"
import { OpeningHoursData } from "@/types"

export function useRestaurantStatus(openingHours: OpeningHoursData, restaurantTimezone: string) {
    const [status, setStatus] = useState<ReturnType<typeof getRestaurantStatusWithClientView> | null>(null)
    const [countdown, setCountdown] = useState<string>("")

    useEffect(() => {
        const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone

        const updateStatus = () => {
            const result = getRestaurantStatusWithClientView(restaurantTimezone, openingHours, clientTz)
            setStatus(result)

            const now = DateTime.now().setZone(clientTz)

            // Parse target time from string
            let targetTime: DateTime | null = null

            if (result?.isOpen && result.closingTime) {
                targetTime = DateTime.fromFormat(result.closingTime, "h:mm a", { zone: restaurantTimezone })
            } else if (!result?.isOpen && result.openingTime) {
                targetTime = DateTime.fromFormat(result.openingTime, "h:mm a", { zone: restaurantTimezone })
            }

            if (targetTime) {
                // Adjust target day if needed (for next day opening)
                if (targetTime < now.setZone(restaurantTimezone)) {
                    targetTime = targetTime.plus({ days: 1 })
                }

                const diff = targetTime.diff(now)
                const dur = Duration.fromObject(diff.toObject()).shiftTo("hours", "minutes", "seconds")

                const hours = String(Math.floor(dur.hours ?? 0)).padStart(2, "0")
                const minutes = String(Math.floor(dur.minutes ?? 0)).padStart(2, "0")
                const seconds = String(Math.floor(dur.seconds ?? 0)).padStart(2, "0")

                setCountdown(`${hours}:${minutes}:${seconds}`)
            } else {
                setCountdown("")
            }
        }

        updateStatus()
        const interval = setInterval(updateStatus, 1000)
        return () => clearInterval(interval)
    }, [openingHours, restaurantTimezone])

    return {
        isOpen: status?.isOpen ?? false,
        openingTime: status?.openingTime ?? null,
        closingTime: status?.closingTime ?? null,
        timeUntilOpen: status?.timeUntilOpen ?? null,
        timeUntilClose: status?.timeUntilClose ?? null,
        nextOpeningDay: status?.nextOpeningDay ?? null,
        countdown,
        raw: status,
    }
}
