import { DateTime } from "luxon"

export type OpeningHoursJson = {
    [key: string]: {
        open: string
        close: string
        closed: boolean
    }
}

const weekdayMap: Record<string, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
}

export function getRestaurantStatusWithClientView(
    restaurantTz: string,
    schedule: OpeningHoursJson,
    clientTz: string
) {
    const nowClient = DateTime.now().setZone(clientTz)
    const nowRestaurant = nowClient.setZone(restaurantTz)
    const today = nowRestaurant.toFormat("cccc").toLowerCase()
    const todaySchedule = schedule[today]

    const getOpeningClosingDateTime = (day: string, base: DateTime) => {
        const sched = schedule[day]

        const open = DateTime.fromFormat(sched.open, "hh:mm a", { zone: restaurantTz }).set({
            year: base.year,
            month: base.month,
            day: base.day,
        })
        const close = DateTime.fromFormat(sched.close, "hh:mm a", { zone: restaurantTz }).set({
            year: base.year,
            month: base.month,
            day: base.day,
        })
        const adjustedClose = close < open ? close.plus({ days: 1 }) : close
        return { open, close: adjustedClose }
    }

    // Check if currently open
    if (todaySchedule && !todaySchedule.closed) {
        const baseToday = nowRestaurant.set({ weekday: weekdayMap[today] as 1 | 2 | 3 | 4 | 5 | 6 | 7 })
        const { open, close } = getOpeningClosingDateTime(today, baseToday)

        const isOpen = nowRestaurant >= open && nowRestaurant <= close

        const openClient = open.setZone(clientTz)
        const closeClient = close.setZone(clientTz)

        // If it's still before opening today
        if (!isOpen && nowRestaurant < open) {
            return {
                isOpen,
                openingTime: openClient.toFormat("hh:mm a"),
                closingTime: closeClient.toFormat("hh:mm a"),
                timeUntilOpen: openClient.diff(nowClient).toFormat("d 'days' h 'hrs' m 'min'"),
                timeUntilClose: null,
                nextOpeningDay: null,
            }
        }

        // If open now
        if (isOpen) {
            return {
                isOpen,
                openingTime: openClient.toFormat("hh:mm a"),
                closingTime: closeClient.toFormat("hh:mm a"),
                timeUntilOpen: null,
                timeUntilClose: closeClient.diff(nowClient).toFormat("h 'hrs' m 'min'"),
                nextOpeningDay: null,
            }
        }
        // If it's after today’s close, fall through to next day finder
    }

    // Find next open day
    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const todayIndex = nowRestaurant.weekday - 1

    for (let i = 1; i <= 7; i++) {
        const dayIndex = (todayIndex + i) % 7
        const day = daysOfWeek[dayIndex]
        const sched = schedule[day]

        if (!sched.closed) {
            const base = nowRestaurant.plus({ days: i })
            const { open } = getOpeningClosingDateTime(day, base)

            const openClient = open.setZone(clientTz)

            return {
                isOpen: false,
                openingTime: openClient.toFormat("hh:mm a"),
                closingTime: sched.close,
                timeUntilOpen: openClient.diff(nowClient).toFormat("d 'days' h 'hrs' m 'min'"),
                timeUntilClose: null,
                nextOpeningDay: day.charAt(0).toUpperCase() + day.slice(1),
            }
        }
    }

    return {
        isOpen: false,
        openingTime: "",
        closingTime: "",
        timeUntilOpen: null,
        timeUntilClose: null,
        nextOpeningDay: null,
    }
}
