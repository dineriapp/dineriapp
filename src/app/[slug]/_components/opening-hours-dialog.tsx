"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock } from "lucide-react"
import { motion } from "motion/react"

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
    openingHours: OpeningHoursData | null
    restaurantName: string
    accentColor: string
}

export function OpeningHoursDialog({
    isOpen,
    onClose,
    openingHours,
    restaurantName,
    accentColor,
}: OpeningHoursDialogProps) {
    if (!openingHours) return null

    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const dayNames = {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
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
            return "Closed"
        }
        return `${formatTime(dayData.open)} - ${formatTime(dayData.close)}`
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] sm:!max-w-[570px]">
                <DialogHeader>
                    <DialogTitle className="flex text-start items-center gap-2">
                        <Clock className="h-5 w-5" style={{ color: accentColor }} />
                        <span>Opening Hours</span>
                    </DialogTitle>
                    <DialogDescription className="text-start">{restaurantName} operating hours</DialogDescription>
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
                                className={`flex items-center justify-between p-3 rounded-lg transition-all ${isToday ? "ring-2 ring-opacity-50" : "bg-gray-50"
                                    }`}
                                style={{
                                    backgroundColor: isToday ? `${accentColor}10` : undefined,
                                    borderColor: isToday ? `${accentColor}40` : undefined,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-2 h-2 rounded-full ${isToday ? "opacity-100" : "opacity-0"}`}
                                        style={{ backgroundColor: accentColor }}
                                    />
                                    <span
                                        className={`font-medium ${isToday ? "text-gray-900" : "text-gray-700"}`}
                                        style={{ color: isToday ? accentColor : undefined }}
                                    >
                                        {dayNames[day as keyof typeof dayNames]}
                                        {isToday && <span className="ml-2 text-xs font-normal opacity-75">(Today)</span>}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span
                                        className={`text-sm ${isClosed ? "text-red-600" : isToday ? "font-medium" : "text-gray-600"}`}
                                        style={{
                                            color: isClosed ? "#dc2626" : isToday ? accentColor : undefined,
                                        }}
                                    >
                                        {getHoursText(dayData || { open: "", close: "", closed: true })}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">Hours may vary on holidays. Please call ahead to confirm.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
