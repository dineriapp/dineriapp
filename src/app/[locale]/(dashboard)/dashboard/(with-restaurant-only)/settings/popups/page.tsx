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
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"



export default function PopupsPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
    const t = useTranslations("Settings.popups");

    const [formData, setFormData] = useState<PopupFormData>({
        welcome_popup_enabled: true,
        welcome_popup_message: t("genericPopup.message.placeholder"),
        welcome_popup_delay: 2,
        welcome_popup_show_button: true,
        welcome_popup_show_info: {
            ratings: true,
            address: true,
            hours: true,
            phone: true,
        },
        menu_popup_enabled: true,
        menu_popup_message: t("genericPopup.message.placeholder"),
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
                    selectedRestaurant.welcome_popup_message || t("genericPopup.message.placeholder"),
                welcome_popup_delay: selectedRestaurant.welcome_popup_delay || 2,
                welcome_popup_show_button: selectedRestaurant.welcome_popup_show_button ?? true,
                welcome_popup_show_info: welcomePopupShowInfo,
                menu_popup_enabled: selectedRestaurant.menu_popup_enabled ?? true,
                menu_popup_message:
                    selectedRestaurant.menu_popup_message || t("genericPopup.message.placeholder"),
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
        toast.success(t("form.reset.title"), {
            description: t("form.reset.description"),
        })
    }

    const saveSettings = async () => {
        if (!selectedRestaurant) {
            toast.error(t("form.noRestaurant"))
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
                throw new Error(errorData.error || t("form.description"))
            }

            const result = await response.json()

            // Update store with response data
            updateSelectedRestaurant(result.data)

            // Update initial data to reflect saved state
            setInitialData(formData)

            toast.success(t("form.save.title"), {
                description: t("form.save.description"),
            })
        } catch (error: any) {
            console.error(t("form.error.title"), error)
            toast.error(t("form.error.title"), {
                description: error.message || t("form.error.description"),
            })
        } finally {
            setSaving(false)
        }
    }

    if (!selectedRestaurant) {
        return (
            <LoadingUI text={t("loading.text")} />
        )
    }

    return (
        <>
            <div className="space-y-6">
                <WelcomePopupCardGeneric
                    prefix="welcome"
                    title={t("welcomePopupRestaurant.title")}
                    description={t("welcomePopupRestaurant.description")}
                    formData={formData}
                    setFormData={setFormData}
                    handlePopupInfoChange={(key, value) =>
                        handlePopupInfoChange("welcome_popup_show_info", key, value)
                    }

                    selectedRestaurant={selectedRestaurant}
                />
                <WelcomePopupCardGeneric
                    prefix="menu"
                    title={t("welcomePopupMenu.title")}
                    description={t("welcomePopupMenu.description")}
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
                            {t("eventAnnouncements.title")}
                        </CardTitle>
                        <CardDescription>
                            {t("eventAnnouncements.description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Enable/Disable Event Announcements */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">
                                    {t("eventAnnouncements.enable_label")}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("eventAnnouncements.enable_description")}
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
                                    <Label>
                                        {t("eventAnnouncements.eventTimeRange.label")}
                                    </Label>
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
                                            <SelectItem value="7">
                                                {t("eventAnnouncements.eventTimeRange.options.7")}
                                            </SelectItem>
                                            <SelectItem value="14">
                                                {t("eventAnnouncements.eventTimeRange.options.14")}

                                            </SelectItem>
                                            <SelectItem value="30">
                                                {t("eventAnnouncements.eventTimeRange.options.30")}
                                            </SelectItem>
                                            <SelectItem value="60">
                                                {t("eventAnnouncements.eventTimeRange.options.60")}
                                            </SelectItem>
                                            <SelectItem value="90">
                                                {t("eventAnnouncements.eventTimeRange.options.90")}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {t("eventAnnouncements.eventTimeRange.helper")}
                                    </p>
                                </div>

                                {/* Maximum Events */}
                                <div className="space-y-2">
                                    <Label>
                                        {t("eventAnnouncements.maxEvents.label")}
                                    </Label>
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
                                            <SelectItem value="1">
                                                {t("eventAnnouncements.maxEvents.options.1")}
                                            </SelectItem>
                                            <SelectItem value="2">
                                                {t("eventAnnouncements.maxEvents.options.2")}
                                            </SelectItem>
                                            <SelectItem value="3">
                                                {t("eventAnnouncements.maxEvents.options.3")}
                                            </SelectItem>
                                            <SelectItem value="5">
                                                {t("eventAnnouncements.maxEvents.options.5")}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {t("eventAnnouncements.maxEvents.helper")}
                                    </p>
                                </div>

                                {/* Rotation Speed */}
                                <div className="space-y-2">
                                    <Label>
                                        {t("eventAnnouncements.rotationSpeed.helper")}
                                    </Label>
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
                                            <SelectItem value="3">
                                                {t("eventAnnouncements.rotationSpeed.options.3")}
                                            </SelectItem>
                                            <SelectItem value="5">
                                                {t("eventAnnouncements.rotationSpeed.options.5")}
                                            </SelectItem>
                                            <SelectItem value="7">
                                                {t("eventAnnouncements.rotationSpeed.options.7")}
                                            </SelectItem>
                                            <SelectItem value="10">
                                                {t("eventAnnouncements.rotationSpeed.options.10")}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {t("eventAnnouncements.rotationSpeed.helper")}
                                    </p>
                                </div>

                                {/* Event Preview */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        {t("eventAnnouncements.preview.label")}
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
                                                    {t("eventAnnouncements.preview.title", { restaurant: selectedRestaurant?.name || "Your Restaurant" })}
                                                </h3>

                                                {/* Mock Event */}
                                                <div className="space-y-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {t("eventAnnouncements.preview.mockEvent.date")}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {t("eventAnnouncements.preview.mockEvent.title")}
                                                    </h4>

                                                    <p className="text-sm text-gray-600">
                                                        {t("eventAnnouncements.preview.mockEvent.description")}
                                                    </p>

                                                    <div className="mt-3 flex justify-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
                                                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                                    </div>
                                                </div>

                                                <Button size="sm" className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">
                                                    {t("eventAnnouncements.preview.mockEvent.cta")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("eventAnnouncements.preview.helper")}
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
