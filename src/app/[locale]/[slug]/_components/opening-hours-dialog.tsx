"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRestaurantStatus } from "@/hooks/useRestaurentStatus"
import { Clock } from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"

interface OpeningHoursData {
    [key: string]: {
        open: string
        close: string
        closed: boolean
    }
}

interface OpeningHoursDialogProps {
    isOpen: boolean
    onClose: () => void
    openingHours: OpeningHoursData
    restaurantName: string
    restaurentTimeZone: string,
    accentColor: string
}

export function OpeningHoursDialog({
    isOpen,
    onClose,
    restaurentTimeZone,
    openingHours,
    restaurantName,
}: OpeningHoursDialogProps) {
    const status = useRestaurantStatus(openingHours, restaurentTimeZone)
    const t = useTranslations("opening_hours_dialog")

    if (!openingHours || !restaurentTimeZone) return null

    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    const dayNames = {
        monday: t("monday"),
        tuesday: t("tuesday"),
        wednesday: t("wednesday"),
        thursday: t("thursday"),
        friday: t("friday"),
        saturday: t("saturday"),
        sunday: t("sunday"),
    }

    const getCurrentDay = () => {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        return days[new Date().getDay()]
    }

    const currentDay = getCurrentDay()

    const formatTime = (time: string) => {
        if (!time) return ""
        return time
    }

    const getHoursText = (dayData: { open: string; close: string; closed: boolean }) => {
        if (dayData.closed || !dayData.open || !dayData.close) {
            return t("closed_label")
        }
        return `${formatTime(dayData.open)} - ${formatTime(dayData.close)}`
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] sm:!max-w-[570px]">
                <DialogHeader>
                    <DialogTitle className="flex text-start items-center gap-2">
                        <Clock className="h-5 w-5 text-teal-600" />
                        <span className="text-gray-800">
                            {t("title")}
                        </span>
                        <span
                            className={`text-sm font-semibold px-4 w-fit py-2 rounded-2xl leading-[1.0]  ${status.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                        >
                            {status.isOpen ? t("open_now") : t("closed_now")}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-start text-gray-500">
                        {t("operating_hours_text", { restaurantName: restaurantName })}
                        <br />
                        {t("timezone_label", { restaurentTimeZone })}
                    </DialogDescription>

                </DialogHeader>

                <div className="space-y-3 py-4">
                    {dayOrder.map((day, index) => {
                        const dayData = openingHours[day]
                        const isToday = day === currentDay
                        const isClosed = !dayData || dayData.closed || !dayData.open || !dayData.close

                        return (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all ${isToday ? "bg-teal-50 ring-2 ring-teal-200" : "bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-2 h-2 rounded-full ${isToday ? "bg-teal-600" : "opacity-0"}`}
                                    />
                                    <span
                                        className={`font-medium ${isToday ? "text-teal-700" : "text-gray-700"
                                            }`}
                                    >
                                        {dayNames[day as keyof typeof dayNames]}
                                        {isToday && (
                                            <span className="ml-2 text-xs font-normal text-gray-500">
                                                {t("today_label")}
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span
                                        className={`text-sm ${isClosed ? "text-red-600" : isToday ? "text-teal-700 font-medium" : "text-gray-600"
                                            }`}
                                    >
                                        {getHoursText(dayData || { open: "", close: "", closed: true })}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">
                        {t("hours_notice")}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
