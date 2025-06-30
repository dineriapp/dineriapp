"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Save } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Generate time slots for the select dropdowns (30-minute intervals)
const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    const date = new Date()
    date.setHours(hour, Number.parseInt(minute), 0, 0)
    return {
        value: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        label: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    }
})

// Mock opening hours data
const mockOpeningHours = [
    { day: "Monday", hours: "11:00 - 22:00" },
    { day: "Tuesday", hours: "11:00 - 22:00" },
    { day: "Wednesday", hours: "11:00 - 22:00" },
    { day: "Thursday", hours: "11:00 - 22:00" },
    { day: "Friday", hours: "11:00 - 23:00" },
    { day: "Saturday", hours: "10:00 - 23:00" },
    { day: "Sunday", hours: "10:00 - 21:00" },
]

export default function HoursPage() {
    const [openingHours, setOpeningHours] = useState<{ day: string; hours: string }[]>([
        { day: "Monday", hours: "" },
        { day: "Tuesday", hours: "" },
        { day: "Wednesday", hours: "" },
        { day: "Thursday", hours: "" },
        { day: "Friday", hours: "" },
        { day: "Saturday", hours: "" },
        { day: "Sunday", hours: "" },
    ])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        const loadData = () => {
            setLoading(true)
            setTimeout(() => {
                const defaultHours = [
                    { day: "Monday", hours: "" },
                    { day: "Tuesday", hours: "" },
                    { day: "Wednesday", hours: "" },
                    { day: "Thursday", hours: "" },
                    { day: "Friday", hours: "" },
                    { day: "Saturday", hours: "" },
                    { day: "Sunday", hours: "" },
                ]

                // Merge existing hours with defaults
                const mergedHours = defaultHours.map((defaultDay) => {
                    const existingDay = mockOpeningHours.find((h) => h.day === defaultDay.day)
                    return existingDay || defaultDay
                })

                setOpeningHours(mergedHours)
                setLoading(false)
            }, 400)
        }
        loadData()
    }, [])

    const updateOpeningHours = (index: number, field: "open" | "close", value: string) => {
        const newHours = [...openingHours]
        const currentHours = newHours[index].hours
        const [currentOpen = "", currentClose = ""] = currentHours.split("-").map((t) => t.trim())

        if (field === "open") {
            newHours[index].hours = `${value}${currentClose ? ` - ${currentClose}` : ""}`
        } else {
            newHours[index].hours = `${currentOpen ? `${currentOpen} - ` : ""}${value}`
        }

        setOpeningHours(newHours)
        setHasChanges(true)
    }

    const clearHours = (index: number) => {
        const newHours = [...openingHours]
        newHours[index].hours = ""
        setOpeningHours(newHours)
        setHasChanges(true)
    }

    const saveProfile = async () => {
        try {
            setSaving(true)

            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success("Opening hours updated", {
                description: "Your restaurant opening hours have been updated successfully",
            })
            setHasChanges(false)
        } catch (error: any) {
            toast.error("Error updating opening hours", {
                description: error.message || "An error occurred while updating your opening hours",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="flex items-center space-x-2 text-slate-500">
                    <svg
                        className="animate-spin h-5 w-5 text-teal-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span>Loading opening hours...</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50/50">
                    <CardTitle className="text-gray-900">Opening Hours</CardTitle>
                    <CardDescription>Set your restaurant&apos;s opening hours</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {openingHours.map((day, index) => {
                            const [openTime = "", closeTime = ""] = day.hours.split("-").map((t) => t.trim())

                            return (
                                <div key={day.day} className="grid grid-cols-[1fr_2fr_2fr_auto] items-center gap-4">
                                    <Label>{day.day}</Label>
                                    <Select value={openTime} onValueChange={(value) => updateOpeningHours(index, "open", value)}>
                                        <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                            <SelectValue placeholder="Opening time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map((slot) => (
                                                <SelectItem key={slot.value} value={slot.value}>
                                                    {slot.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={closeTime} onValueChange={(value) => updateOpeningHours(index, "close", value)}>
                                        <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                            <SelectValue placeholder="Closing time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map((slot) => (
                                                <SelectItem key={slot.value} value={slot.value}>
                                                    {slot.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => clearHours(index)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            )
                        })}
                        <p className="mt-2 text-xs text-muted-foreground">Clear the times for days when you&apos;re closed</p>
                    </div>
                </CardContent>
            </Card>

            {/* Floating Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: hasChanges ? 1 : 0,
                    y: hasChanges ? 0 : 20,
                }}
                className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 flex items-end sm:items-center sm:flex-row-reverse flex-col gap-2 sm:gap-4"
            >
                <div className="rounded-lg border bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>You have unsaved changes</span>
                    </div>
                </div>
                <Button
                    onClick={saveProfile}
                    disabled={saving || !hasChanges}
                    size="lg"
                    className="bg-emerald-600 shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </motion.div>
        </>
    )
}
