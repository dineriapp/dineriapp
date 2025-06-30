"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, RotateCcw, Save } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRestaurantStore } from "@/stores/restaurant-store"

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

interface DayHours {
    day: string
    open: string
    close: string
    closed: boolean
}

interface OpeningHoursFormData {
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours
}

const defaultDayHours: DayHours = {
    day: "",
    open: "",
    close: "",
    closed: true,
}

const defaultFormData: OpeningHoursFormData = {
    monday: { ...defaultDayHours, day: "Monday" },
    tuesday: { ...defaultDayHours, day: "Tuesday" },
    wednesday: { ...defaultDayHours, day: "Wednesday" },
    thursday: { ...defaultDayHours, day: "Thursday" },
    friday: { ...defaultDayHours, day: "Friday" },
    saturday: { ...defaultDayHours, day: "Saturday" },
    sunday: { ...defaultDayHours, day: "Sunday" },
}

export default function HoursPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
    const [formData, setFormData] = useState<OpeningHoursFormData>(defaultFormData)
    const [initialData, setInitialData] = useState<OpeningHoursFormData>(defaultFormData)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Load initial data from restaurant store
    useEffect(() => {
        if (selectedRestaurant) {
            const loadedData = parseOpeningHours(selectedRestaurant.opening_hours)
            setFormData(loadedData)
            setInitialData(loadedData)
            setLoading(false)
        } else {
            setLoading(false)
        }
    }, [selectedRestaurant])

    // Check for changes
    useEffect(() => {
        const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(initialData)
        setHasChanges(hasFormChanges)
    }, [formData, initialData])

    // Parse opening hours from database JSON format
    const parseOpeningHours = (openingHoursJson: any): OpeningHoursFormData => {
        if (!openingHoursJson || typeof openingHoursJson !== "object") {
            return defaultFormData
        }

        const result = { ...defaultFormData }

        Object.keys(result).forEach((dayKey) => {
            const dayData = openingHoursJson[dayKey]
            if (dayData && typeof dayData === "object") {
                result[dayKey as keyof OpeningHoursFormData] = {
                    day: result[dayKey as keyof OpeningHoursFormData].day,
                    open: dayData.open || "",
                    close: dayData.close || "",
                    closed: dayData.closed !== false, // Default to closed if not explicitly false
                }
            }
        })

        return result
    }

    // Convert form data to database JSON format
    const formatOpeningHours = (data: OpeningHoursFormData) => {
        const result: any = {}

        Object.entries(data).forEach(([dayKey, dayData]) => {
            result[dayKey] = {
                open: dayData.closed ? "" : dayData.open,
                close: dayData.closed ? "" : dayData.close,
                closed: dayData.closed,
            }
        })

        return result
    }

    const updateDayHours = (dayKey: keyof OpeningHoursFormData, field: keyof DayHours, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                [field]: value,
                // If setting to not closed, ensure we don't clear the times
                ...(field === "closed" && value === false ? {} : {}),
                // If setting to closed, clear the times
                ...(field === "closed" && value === true ? { open: "", close: "" } : {}),
            },
        }))
    }

    const toggleDayClosed = (dayKey: keyof OpeningHoursFormData) => {
        const currentDay = formData[dayKey]
        updateDayHours(dayKey, "closed", !currentDay.closed)
    }

    const resetForm = () => {
        setFormData(initialData)
        toast.success("Form reset", {
            description: "All changes have been discarded",
        })
    }

    const saveOpeningHours = async () => {
        if (!selectedRestaurant) {
            toast.error("No restaurant selected")
            return
        }

        try {
            setSaving(true)

            // Validate that open days have both open and close times
            const invalidDays = Object.entries(formData).filter(([_, dayData]) => {
                console.log(_)
                return !dayData.closed && (!dayData.open || !dayData.close)
            })

            if (invalidDays.length > 0) {
                toast.error("Invalid opening hours", {
                    description: "Please set both opening and closing times for open days, or mark them as closed",
                })
                return
            }

            // Validate that close time is after open time
            const invalidTimes = Object.entries(formData).filter(([_, dayData]) => {
                if (dayData.closed) return false
                console.log(_)
                const openTime = new Date(`2000-01-01 ${dayData.open}`)
                const closeTime = new Date(`2000-01-01 ${dayData.close}`)

                return closeTime <= openTime
            })

            if (invalidTimes.length > 0) {
                toast.error("Invalid time range", {
                    description: "Closing time must be after opening time",
                })
                return
            }

            const openingHoursData = formatOpeningHours(formData)

            const response = await fetch(`/api/restaurants/${selectedRestaurant.id}/hours`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    opening_hours: openingHoursData,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update opening hours")
            }

            const result = await response.json()

            // Update the store with the response data
            updateSelectedRestaurant({
                opening_hours: result.data.opening_hours,
            })

            // Update initial data to reflect saved state
            setInitialData(formData)

            toast.success("Opening hours updated", {
                description: "Your restaurant opening hours have been updated successfully",
            })
        } catch (error: any) {
            console.error("Error updating opening hours:", error)
            toast.error("Error updating opening hours", {
                description: error.message || "An error occurred while updating your opening hours",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading || !selectedRestaurant) {
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
                    <CardDescription>Set your restaurant&apos;s opening hours for each day of the week</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {Object.entries(formData).map(([dayKey, dayData]) => (
                            <div key={dayKey} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">{dayData.day}</Label>
                                    <Button
                                        type="button"
                                        variant={dayData.closed ? "outline" : "secondary"}
                                        size="sm"
                                        onClick={() => toggleDayClosed(dayKey as keyof OpeningHoursFormData)}
                                        className={
                                            dayData.closed ? "text-slate-600" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        }
                                    >
                                        {dayData.closed ? "Closed" : "Open"}
                                    </Button>
                                </div>

                                {!dayData.closed && (
                                    <div className="grid grid-cols-2 gap-4 ml-4">
                                        <div className="space-y-2 w-full">
                                            <Label htmlFor={`${dayKey}-open`} className="text-sm text-slate-600">
                                                Opening time
                                            </Label>
                                            <Select

                                                value={dayData.open}
                                                onValueChange={(value) => updateDayHours(dayKey as keyof OpeningHoursFormData, "open", value)}
                                            >
                                                <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                                    <SelectValue placeholder="Select opening time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((slot) => (
                                                        <SelectItem key={`${dayKey}-open-${slot.value}`} value={slot.value}>
                                                            {slot.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2 w-full">
                                            <Label htmlFor={`${dayKey}-close`} className="text-sm text-slate-600">
                                                Closing time
                                            </Label>
                                            <Select
                                                value={dayData.close}
                                                onValueChange={(value) => updateDayHours(dayKey as keyof OpeningHoursFormData, "close", value)}
                                            >
                                                <SelectTrigger className="focus:border-emerald-500 w-full focus:ring-emerald-500">
                                                    <SelectValue placeholder="Select closing time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((slot) => (
                                                        <SelectItem key={`${dayKey}-close-${slot.value}`} value={slot.value}>
                                                            {slot.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">
                                <strong>Tip:</strong> Click &quot;Closed&quot; for days when your restaurant is not open. Make sure closing time
                                is after opening time for open days.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Floating Action Buttons */}
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

                <div className="flex gap-2">
                    <Button
                        onClick={resetForm}
                        disabled={saving || !hasChanges}
                        variant="outline"
                        size="lg"
                        className="shadow-lg bg-transparent"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>

                    <Button
                        onClick={saveOpeningHours}
                        disabled={saving || !hasChanges}
                        size="lg"
                        className="bg-emerald-600 shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </motion.div>
        </>
    )
}
