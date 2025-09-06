"use client"

import LoadingUI from "@/components/loading-ui"
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Generate time slots for the select dropdowns (30-minute intervals)
const fmt = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});

const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const date = new Date();
    date.setHours(Math.floor(i / 2), i % 2 === 0 ? 0 : 30, 0, 0);
    const str = fmt.format(date);
    return { value: str, label: str };
});
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

const allTimezones = Intl.supportedValuesOf("timeZone")



export default function HoursPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
    const [formData, setFormData] = useState<OpeningHoursFormData>(defaultFormData)
    const [initialData, setInitialData] = useState<OpeningHoursFormData>(defaultFormData)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [selectedTimeZone, setSelectedTimeZone] = useState<string>("")

    // Load initial data from restaurant store
    useEffect(() => {
        if (selectedRestaurant) {
            const loadedData = parseOpeningHours(selectedRestaurant.opening_hours)
            setFormData(loadedData)
            setInitialData(loadedData)
            setSelectedTimeZone(selectedRestaurant?.timezone || "")
            setLoading(false)
        } else {
            setLoading(false)
        }
    }, [selectedRestaurant])


    console.log({ selectedTimeZone, initial: selectedRestaurant?.timezone || "" })


    useEffect(() => {
        const hasFormChanges =
            JSON.stringify(formData) !== JSON.stringify(initialData) ||
            selectedTimeZone !== (selectedRestaurant?.timezone || "");
        setHasChanges(hasFormChanges);
    }, [formData, initialData, selectedTimeZone, selectedRestaurant]);

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
                    timezone: selectedTimeZone,
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
                timezone: selectedTimeZone
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
            <LoadingUI text="Loading opening hours..." />
        )
    }

    return (
        <>
            <Card className="border-gray-200 pt-0 box-shad-every-2 shadow-md gap-0">
                <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                    <CardTitle className="text-gray-900">Opening Hours</CardTitle>
                    <CardDescription>Set your restaurant&apos;s opening hours for each day of the week</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="mb-6">
                        <Label className="text-base font-medium mb-2">Timezone</Label>
                        <Select
                            value={selectedTimeZone}
                            onValueChange={(value) =>
                                setSelectedTimeZone(value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select restaurant timezone" />
                            </SelectTrigger>
                            <SelectContent className="">
                                <div className="!max-h-[300px] !overflow-y-auto h-[300px] py-1">
                                    {allTimezones.map((tz) => (
                                        <SelectItem key={tz} value={tz}>
                                            {tz} — <span className="text-gray-500 text-xs">{tz}</span>
                                        </SelectItem>
                                    ))}
                                </div>
                            </SelectContent>
                        </Select>
                    </div>
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
                                            `h-[38px] rounded-full px-4 text-xs font-poppins cursor-pointer ${dayData.closed ? "text-white bg-main-blue hover:bg-main-blue/70 hover:text-white" : "bg-main-green text-white hover:bg-main-green/70 hover:text-white"}`
                                        }
                                    >
                                        {dayData.closed ? "Closed" : "Open"}
                                    </Button>
                                </div>

                                {!dayData.closed && (
                                    <div className="grid grid-cols-2 gap-4">
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
            {/* Floating Save Button */}
            <UnsavedChangesPanel
                hasChanges={hasChanges}
                saving={saving}
                resetForm={resetForm}
                saveSettings={saveOpeningHours}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />

        </>
    )
}
