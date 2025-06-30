"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertCircle,
    Calendar,
    Clock,
    Eye,
    MapPinIcon,
    MessageSquare,
    Phone,
    Save,
    Star,
    Timer,
    Zap,
} from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Mock restaurant data for preview
const mockRestaurant = {
    name: "Bella Vista Restaurant",
    address: "123 Restaurant Street, Downtown, New York, NY 10001",
    phone: "+1 (555) 123-4567",
    average_rating: 4.8,
    review_count: 247,
}

// Mock popup settings data
const mockPopupData = {
    welcome_popup_enabled: true,
    welcome_popup_message: "Welcome to Bella Vista! We're excited to serve you authentic Italian cuisine.",
    welcome_popup_delay: 3,
    welcome_popup_show_button: true,
    welcome_popup_show_info: {
        ratings: true,
        address: true,
        hours: true,
        phone: true,
    },
    event_announcements_enabled: true,
    event_announcement_days: 30,
    max_events_in_popup: 3,
    event_rotation_speed: 5,
}

export default function PopupsPage() {
    // Welcome popup settings
    const [welcomePopupEnabled, setWelcomePopupEnabled] = useState(true)
    const [welcomePopupMessage, setWelcomePopupMessage] = useState("Welcome! We're excited to have you visit us.")
    const [welcomePopupDelay, setWelcomePopupDelay] = useState(2)
    const [welcomePopupShowButton, setWelcomePopupShowButton] = useState(true)
    const [welcomePopupShowInfo, setWelcomePopupShowInfo] = useState({
        ratings: true,
        address: true,
        hours: true,
        phone: true,
    })

    // Event announcement settings
    const [eventAnnouncementsEnabled, setEventAnnouncementsEnabled] = useState(true)
    const [eventAnnouncementDays, setEventAnnouncementDays] = useState(30)
    const [maxEventsInPopup, setMaxEventsInPopup] = useState(3)
    const [eventRotationSpeed, setEventRotationSpeed] = useState(5)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        const loadData = () => {
            setLoading(true)
            setTimeout(() => {
                const data = mockPopupData

                // Load popup settings
                setWelcomePopupEnabled(data.welcome_popup_enabled ?? true)
                setWelcomePopupMessage(data.welcome_popup_message || "Welcome! We're excited to have you visit us.")
                setWelcomePopupDelay(data.welcome_popup_delay || 2)
                setWelcomePopupShowButton(data.welcome_popup_show_button ?? true)
                setWelcomePopupShowInfo(
                    data.welcome_popup_show_info || {
                        ratings: true,
                        address: true,
                        hours: true,
                        phone: true,
                    },
                )

                // Load event announcement settings
                setEventAnnouncementsEnabled(data.event_announcements_enabled ?? true)
                setEventAnnouncementDays(data.event_announcement_days || 30)
                setMaxEventsInPopup(data.max_events_in_popup || 3)
                setEventRotationSpeed(data.event_rotation_speed || 5)

                setLoading(false)
            }, 400)
        }
        loadData()
    }, [])

    const handlePopupInfoChange = (key: keyof typeof welcomePopupShowInfo, value: boolean) => {
        setWelcomePopupShowInfo((prev) => ({
            ...prev,
            [key]: value,
        }))
        setHasChanges(true)
    }

    const saveProfile = async () => {
        try {
            setSaving(true)
            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success("Popup settings updated", {
                description: "Your popup settings have been updated successfully",
            })
            setHasChanges(false)
        } catch (error: any) {
            toast.error("Error updating popup settings", {
                description: error.message || "An error occurred while updating your popup settings",
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
                    <span>Loading popup settings...</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="bg-gray-50/50">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Zap className="h-5 w-5 text-emerald-600" />
                            Welcome Popup
                        </CardTitle>
                        <CardDescription>Show a welcome message to first-time visitors</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Enable/Disable Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable Welcome Popup</Label>
                                <p className="text-sm text-muted-foreground">Show a welcome popup to new visitors</p>
                            </div>
                            <Switch
                                checked={welcomePopupEnabled}
                                onCheckedChange={(checked) => {
                                    setWelcomePopupEnabled(checked)
                                    setHasChanges(true)
                                }}
                            />
                        </div>

                        {welcomePopupEnabled && (
                            <>
                                {/* Custom Message */}
                                <div className="space-y-2">
                                    <Label htmlFor="popup-message" className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Welcome Message
                                    </Label>
                                    <Textarea
                                        id="popup-message"
                                        value={welcomePopupMessage}
                                        onChange={(e) => {
                                            setWelcomePopupMessage(e.target.value)
                                            setHasChanges(true)
                                        }}
                                        placeholder="Welcome! We're excited to have you visit us."
                                        rows={3}
                                        maxLength={200}
                                        className="focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div className="text-right text-xs text-muted-foreground">
                                        {welcomePopupMessage.length}/200 characters
                                    </div>
                                </div>

                                {/* Timing Control */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Timer className="h-4 w-4" />
                                        Show Delay
                                    </Label>
                                    <Select
                                        value={welcomePopupDelay.toString()}
                                        onValueChange={(value) => {
                                            setWelcomePopupDelay(Number.parseInt(value))
                                            setHasChanges(true)
                                        }}
                                    >
                                        <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seconds) => (
                                                <SelectItem key={seconds} value={seconds.toString()}>
                                                    {seconds} second{seconds > 1 ? "s" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">How long to wait before showing the popup</p>
                                </div>

                                {/* Show Button Toggle */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Show Action Button</Label>
                                        <p className="text-sm text-muted-foreground">Display the &quot;Explore&quot; button in the popup</p>
                                    </div>
                                    <Switch
                                        checked={welcomePopupShowButton}
                                        onCheckedChange={(checked) => {
                                            setWelcomePopupShowButton(checked)
                                            setHasChanges(true)
                                        }}
                                    />
                                </div>

                                {/* Information Display Options */}
                                <div className="space-y-4">
                                    <Label className="text-base">Show Information</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="show-ratings"
                                                checked={welcomePopupShowInfo.ratings}
                                                onCheckedChange={(checked) => handlePopupInfoChange("ratings", checked)}
                                            />
                                            <Label htmlFor="show-ratings" className="flex items-center gap-2">
                                                <Star className="h-4 w-4" />
                                                Ratings
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="show-address"
                                                checked={welcomePopupShowInfo.address}
                                                onCheckedChange={(checked) => handlePopupInfoChange("address", checked)}
                                            />
                                            <Label htmlFor="show-address" className="flex items-center gap-2">
                                                <MapPinIcon className="h-4 w-4" />
                                                Address
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="show-hours"
                                                checked={welcomePopupShowInfo.hours}
                                                onCheckedChange={(checked) => handlePopupInfoChange("hours", checked)}
                                            />
                                            <Label htmlFor="show-hours" className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Opening Hours
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="show-phone"
                                                checked={welcomePopupShowInfo.phone}
                                                onCheckedChange={(checked) => handlePopupInfoChange("phone", checked)}
                                            />
                                            <Label htmlFor="show-phone" className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </Label>
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <div className="mx-auto max-w-sm overflow-hidden rounded-xl bg-white shadow-lg">
                                            <div className="p-6 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                                                    <span className="text-2xl font-bold text-white">
                                                        {mockRestaurant?.name?.charAt(0) || "R"}
                                                    </span>
                                                </div>
                                                <h3 className="mb-2 text-lg font-bold">
                                                    Welcome to {mockRestaurant?.name || "Your Restaurant"}!
                                                </h3>
                                                <p className="mb-4 text-sm text-gray-600">{welcomePopupMessage}</p>
                                                <div className="space-y-2 text-xs text-gray-500">
                                                    {welcomePopupShowInfo.ratings && mockRestaurant?.average_rating && (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span>
                                                                {mockRestaurant.average_rating.toFixed(1)} ({mockRestaurant.review_count} reviews)
                                                            </span>
                                                        </div>
                                                    )}
                                                    {welcomePopupShowInfo.address && mockRestaurant?.address && (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <MapPinIcon className="h-3 w-3" />
                                                            <span>{mockRestaurant.address.split(",")[0]}</span>
                                                        </div>
                                                    )}
                                                    {welcomePopupShowInfo.hours && (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>Open Today</span>
                                                        </div>
                                                    )}
                                                    {welcomePopupShowInfo.phone && mockRestaurant?.phone && (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{mockRestaurant.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {welcomePopupShowButton && (
                                                    <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                                                        Explore
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This is how your welcome popup will appear to visitors
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Event Announcements Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="bg-gray-50/50">
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
                                checked={eventAnnouncementsEnabled}
                                onCheckedChange={(checked) => {
                                    setEventAnnouncementsEnabled(checked)
                                    setHasChanges(true)
                                }}
                            />
                        </div>

                        {eventAnnouncementsEnabled && (
                            <>
                                {/* Event Time Range */}
                                <div className="space-y-2">
                                    <Label>Event Time Range</Label>
                                    <Select
                                        value={eventAnnouncementDays.toString()}
                                        onValueChange={(value) => {
                                            setEventAnnouncementDays(Number.parseInt(value))
                                            setHasChanges(true)
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
                                        value={maxEventsInPopup.toString()}
                                        onValueChange={(value) => {
                                            setMaxEventsInPopup(Number.parseInt(value))
                                            setHasChanges(true)
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
                                        value={eventRotationSpeed.toString()}
                                        onValueChange={(value) => {
                                            setEventRotationSpeed(Number.parseInt(value))
                                            setHasChanges(true)
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
                                                        {mockRestaurant?.name?.charAt(0) || "R"}
                                                    </span>
                                                </div>
                                                <h3 className="mb-2 text-lg font-bold">
                                                    Welcome to {mockRestaurant?.name || "Your Restaurant"}!
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
