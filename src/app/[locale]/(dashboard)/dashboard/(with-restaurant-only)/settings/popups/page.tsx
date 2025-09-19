"use client"

import LoadingUI from "@/components/loading-ui"
import { WelcomePopupCardGeneric } from "@/components/pages/dashboard/settings/popups/welcome-popup-card-generic"
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { PopupFormData } from "@/types"
import {
    Calendar,
    Eye
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"



export default function PopupsPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()

    const [formData, setFormData] = useState<PopupFormData>({
        welcome_popup_enabled: true,
        welcome_popup_message: "Welcome! We're excited to have you visit us.",
        welcome_popup_delay: 2,
        welcome_popup_show_button: true,
        welcome_popup_show_info: {
            ratings: true,
            address: true,
            hours: true,
            phone: true,
        },
        menu_popup_enabled: true,
        menu_popup_message: "Welcome! We're excited to have you visit us.",
        menu_popup_delay: 2,
        menu_popup_show_button: true,
        menu_popup_show_info: {
            ratings: true,
            address: true,
            hours: true,
            phone: true,
        },
        event_announcements_enabled: true,
        event_announcement_days: 30,
        max_events_in_popup: 3,
        event_rotation_speed: 5,
    })

    const [initialData, setInitialData] = useState<PopupFormData>(formData)
    const [saving, setSaving] = useState(false)

    // Load data from restaurant store
    useEffect(() => {
        if (selectedRestaurant) {
            const welcomePopupShowInfo = selectedRestaurant.welcome_popup_show_info
                ? typeof selectedRestaurant.welcome_popup_show_info === "string"
                    ? JSON.parse(selectedRestaurant.welcome_popup_show_info)
                    : selectedRestaurant.welcome_popup_show_info
                : { ratings: true, address: true, hours: true, phone: true }
            const menuPopupShowInfo = selectedRestaurant.menu_popup_show_info
                ? typeof selectedRestaurant.menu_popup_show_info === "string"
                    ? JSON.parse(selectedRestaurant.menu_popup_show_info)
                    : selectedRestaurant.menu_popup_show_info
                : { ratings: true, address: true, hours: true, phone: true }

            const data: PopupFormData = {
                welcome_popup_enabled: selectedRestaurant.welcome_popup_enabled ?? true,
                welcome_popup_message:
                    selectedRestaurant.welcome_popup_message || "Welcome! We're excited to have you visit us.",
                welcome_popup_delay: selectedRestaurant.welcome_popup_delay || 2,
                welcome_popup_show_button: selectedRestaurant.welcome_popup_show_button ?? true,
                welcome_popup_show_info: welcomePopupShowInfo,
                menu_popup_enabled: selectedRestaurant.menu_popup_enabled ?? true,
                menu_popup_message:
                    selectedRestaurant.menu_popup_message || "Welcome! We're excited to have you visit us.",
                menu_popup_delay: selectedRestaurant.menu_popup_delay || 2,
                menu_popup_show_button: selectedRestaurant.menu_popup_show_button ?? true,
                menu_popup_show_info: menuPopupShowInfo,
                event_announcements_enabled: selectedRestaurant.event_announcements_enabled ?? true,
                event_announcement_days: selectedRestaurant.event_announcement_days || 30,
                max_events_in_popup: selectedRestaurant.max_events_in_popup || 3,
                event_rotation_speed: selectedRestaurant.event_rotation_speed || 5,
            }

            setFormData(data)
            setInitialData(data)
        }
    }, [selectedRestaurant])

    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

    type InfoKey = "welcome_popup_show_info" | "menu_popup_show_info";

    const handlePopupInfoChange = <
        T extends InfoKey,
    >(
        section: T,
        key: string,
        value: boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };


    const resetForm = () => {
        setFormData(initialData)
        toast.success("Form reset", {
            description: "All changes have been discarded",
        })
    }

    const saveSettings = async () => {
        if (!selectedRestaurant) {
            toast.error("No restaurant selected")
            return
        }

        try {
            setSaving(true)

            const response = await fetch(`/api/restaurants/${selectedRestaurant.id}/popups`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update popup settings")
            }

            const result = await response.json()

            // Update store with response data
            updateSelectedRestaurant(result.data)

            // Update initial data to reflect saved state
            setInitialData(formData)

            toast.success("Popup settings updated", {
                description: "Your popup settings have been updated successfully",
            })
        } catch (error: any) {
            console.error("Error updating popup settings:", error)
            toast.error("Error updating popup settings", {
                description: error.message || "An error occurred while updating your popup settings",
            })
        } finally {
            setSaving(false)
        }
    }

    if (!selectedRestaurant) {
        return (
            <LoadingUI text="Loading popups information..." />
        )
    }

    return (
        <>
            <div className="space-y-6">
                <WelcomePopupCardGeneric
                    prefix="welcome"
                    title="Welcome Popup Restaurant Page"
                    description="Show a welcome message to first-time visitors"
                    formData={formData}
                    setFormData={setFormData}
                    handlePopupInfoChange={(key, value) =>
                        handlePopupInfoChange("welcome_popup_show_info", key, value)
                    }

                    selectedRestaurant={selectedRestaurant}
                />
                <WelcomePopupCardGeneric
                    prefix="menu"
                    title="Welcome Popup Menu Page"
                    description="Show a welcome message to first-time visitors"
                    formData={formData}
                    setFormData={setFormData}
                    handlePopupInfoChange={(key, value) =>
                        handlePopupInfoChange("menu_popup_show_info", key, value)
                    }
                    selectedRestaurant={selectedRestaurant}
                />

                {/* Event Announcements Card */}
                <Card className="pt-0 box-shad-every-2 shadow-md border-gray-200">
                    <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Calendar className="h-5 w-5 text-emerald-600" />
                            Event Announcements
                        </CardTitle>
                        <CardDescription>Automatically promote your upcoming events in the welcome popup</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Enable/Disable Event Announcements */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable Event Announcements</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show upcoming events instead of welcome message when available
                                </p>
                            </div>
                            <Switch
                                checked={formData.event_announcements_enabled}
                                onCheckedChange={(checked) => {
                                    setFormData((prev) => ({ ...prev, event_announcements_enabled: checked }))
                                }}
                            />
                        </div>

                        {formData.event_announcements_enabled && (
                            <>
                                {/* Event Time Range */}
                                <div className="space-y-2">
                                    <Label>Event Time Range</Label>
                                    <Select
                                        value={formData.event_announcement_days.toString()}
                                        onValueChange={(value) => {
                                            setFormData((prev) => ({ ...prev, event_announcement_days: Number.parseInt(value) }))
                                        }}
                                    >
                                        <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">Next 7 days</SelectItem>
                                            <SelectItem value="14">Next 2 weeks</SelectItem>
                                            <SelectItem value="30">Next 30 days</SelectItem>
                                            <SelectItem value="60">Next 2 months</SelectItem>
                                            <SelectItem value="90">Next 3 months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Only show events happening within this time period</p>
                                </div>

                                {/* Maximum Events */}
                                <div className="space-y-2">
                                    <Label>Maximum Events in Popup</Label>
                                    <Select
                                        value={formData.max_events_in_popup.toString()}
                                        onValueChange={(value) => {
                                            setFormData((prev) => ({ ...prev, max_events_in_popup: Number.parseInt(value) }))
                                        }}
                                    >
                                        <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 event</SelectItem>
                                            <SelectItem value="2">2 events</SelectItem>
                                            <SelectItem value="3">3 events</SelectItem>
                                            <SelectItem value="5">5 events</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">How many events to show at once (most urgent first)</p>
                                </div>

                                {/* Rotation Speed */}
                                <div className="space-y-2">
                                    <Label>Event Rotation Speed</Label>
                                    <Select
                                        value={formData.event_rotation_speed.toString()}
                                        onValueChange={(value) => {
                                            setFormData((prev) => ({ ...prev, event_rotation_speed: Number.parseInt(value) }))
                                        }}
                                    >
                                        <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 seconds</SelectItem>
                                            <SelectItem value="5">5 seconds</SelectItem>
                                            <SelectItem value="7">7 seconds</SelectItem>
                                            <SelectItem value="10">10 seconds</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">How fast to rotate between multiple events</p>
                                </div>

                                {/* Event Preview */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Event Announcement Preview
                                    </Label>
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <div className="mx-auto max-w-sm overflow-hidden rounded-xl bg-white shadow-lg">
                                            <div className="p-6 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                                                    <span className="text-2xl font-bold text-white">
                                                        {selectedRestaurant?.name?.charAt(0) || "R"}
                                                    </span>
                                                </div>
                                                <h3 className="mb-2 text-lg font-bold">
                                                    Welcome to {selectedRestaurant?.name || "Your Restaurant"}!
                                                </h3>

                                                {/* Mock Event */}
                                                <div className="space-y-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>This Friday</span>
                                                    </div>

                                                    <h4 className="text-lg font-semibold text-gray-900">Live Jazz Night</h4>

                                                    <p className="text-sm text-gray-600">Join us for an evening of smooth jazz and great food</p>

                                                    <div className="mt-3 flex justify-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
                                                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                                    </div>
                                                </div>

                                                <Button size="sm" className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">
                                                    Get Event Tickets
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This is how event announcements will appear in your popup
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Floating Action Buttons */}
            <UnsavedChangesPanel
                hasChanges={hasChanges}
                saving={saving}
                resetForm={resetForm}
                saveSettings={saveSettings}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />
        </>
    )
}
