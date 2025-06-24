"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertCircle,
    Building2,
    Calendar,
    ChevronRight,
    Clock,
    Eye,
    Facebook,
    Globe2,
    Instagram,
    Mail,
    MapPin,
    MapPinIcon,
    MessageCircle,
    MessageSquare,
    Phone,
    Save,
    ShieldAlert,
    Star,
    Timer,
    Zap,
} from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Mock restaurant data type
interface Restaurant {
    id: string
    name: string
    slug: string
    bio?: string
    logo_url?: string
    phone?: string
    email?: string
    address?: string
    instagram?: string
    facebook?: string
    whatsapp?: string
    google_place_id?: string
    latitude?: number
    longitude?: number
    social_icons_position: "top" | "bottom"
    welcome_popup_enabled: boolean
    welcome_popup_message: string
    welcome_popup_delay: number
    welcome_popup_show_button: boolean
    welcome_popup_show_info: {
        ratings: boolean
        address: boolean
        hours: boolean
        phone: boolean
    }
    event_announcements_enabled: boolean
    event_announcement_days: number
    max_events_in_popup: number
    event_rotation_speed: number
    opening_hours: { day: string; hours: string }[]
    average_rating?: number
    review_count?: number
}

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

const sections = [
    {
        id: "business",
        title: "Business Information",
        icon: Building2,
        description: "Basic information about your restaurant",
    },
    {
        id: "contact",
        title: "Contact Information",
        icon: Phone,
        description: "How customers can reach you",
    },
    {
        id: "change-password",
        title: "Change Password",
        icon: ShieldAlert,
        description: "Update your profile password.",
    },
    {
        id: "hours",
        title: "Opening Hours",
        icon: Clock,
        description: "When your restaurant is open",
    },
    {
        id: "social",
        title: "Social Media",
        icon: Instagram,
        description: "Connect your social profiles",
    },
    {
        id: "popups",
        title: "Popups",
        icon: Zap,
        description: "Manage welcome popups and notifications",
    },
    {
        id: "integrations",
        title: "Integrations",
        icon: Globe2,
        description: "Connect third-party services",
    },
]

// Mock restaurant data
const mockRestaurant: Restaurant = {
    id: "1",
    name: "Bella Vista Restaurant",
    slug: "bella-vista-restaurant",
    bio: "Authentic Italian cuisine in the heart of the city with fresh ingredients and traditional recipes.",
    logo_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&crop=center",
    phone: "+1 (555) 123-4567",
    email: "info@bellavista.com",
    address: "123 Restaurant Street, Downtown, New York, NY 10001",
    instagram: "https://instagram.com/bellavista.restaurant",
    facebook: "https://facebook.com/bellavista.restaurant",
    whatsapp: "+15551234567",
    google_place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    latitude: 40.7128,
    longitude: -74.006,
    social_icons_position: "top",
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
    opening_hours: [
        { day: "Monday", hours: "11:00 - 22:00" },
        { day: "Tuesday", hours: "11:00 - 22:00" },
        { day: "Wednesday", hours: "11:00 - 22:00" },
        { day: "Thursday", hours: "11:00 - 22:00" },
        { day: "Friday", hours: "11:00 - 23:00" },
        { day: "Saturday", hours: "10:00 - 23:00" },
        { day: "Sunday", hours: "10:00 - 21:00" },
    ],
    average_rating: 4.8,
    review_count: 247,
}

export default function SettingsPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [bio, setBio] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [instagram, setInstagram] = useState("")
    const [facebook, setFacebook] = useState("")
    const [whatsapp, setWhatsapp] = useState("")
    const [googlePlaceId, setGooglePlaceId] = useState("")
    const [latitude, setLatitude] = useState<number | undefined>()
    const [longitude, setLongitude] = useState<number | undefined>()
    const [socialIconsPosition, setSocialIconsPosition] = useState<"top" | "bottom">("top")

    // Popup settings
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
    const [activeSection, setActiveSection] = useState("business")
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        // Simulate loading data
        const loadData = () => {
            setLoading(true)

            // Simulate API delay
            setTimeout(() => {
                const data = mockRestaurant

                setRestaurant(data)
                setName(data.name)
                setSlug(data.slug)
                setBio(data.bio || "")
                setLogoUrl(data.logo_url || "")
                setPhone(data.phone || "")
                setEmail(data.email || "")
                setAddress(data.address || "")
                setInstagram(data.instagram || "")
                setFacebook(data.facebook || "")
                setWhatsapp(data.whatsapp || "")
                setGooglePlaceId(data.google_place_id || "")
                setLatitude(data.latitude)
                setLongitude(data.longitude)
                setSocialIconsPosition(data.social_icons_position || "top")

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

                if (data.opening_hours) {
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
                        const existingDay = data.opening_hours.find((h) => h.day === defaultDay.day)
                        return existingDay || defaultDay
                    })

                    setOpeningHours(mergedHours)
                }

                setLoading(false)
            }, 400)
        }

        loadData()
    }, [])

    const saveProfile = async () => {
        if (!restaurant) return

        try {
            setSaving(true)

            // Simulate slug uniqueness check
            if (slug !== restaurant.slug) {
                // Mock validation - in real app this would be an API call
                const existingSlugs = ["taken-slug", "another-restaurant", "busy-cafe"]
                if (existingSlugs.includes(slug)) {
                    toast.error("Slug already exists", {
                        description: "Please choose a different URL for your restaurant page",
                    })
                    setSaving(false)
                    return
                }
            }

            // Filter out empty opening hours and format them correctly
            const filteredHours = openingHours
                .filter((day) => day.hours.trim() !== "")
                .map((day) => ({
                    day: day.day,
                    hours: day.hours.trim(),
                }))

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Update local restaurant state
            const updatedRestaurant: Restaurant = {
                ...restaurant,
                name,
                slug,
                bio,
                logo_url: logoUrl,
                phone,
                email,
                address,
                instagram,
                facebook,
                whatsapp,
                google_place_id: googlePlaceId,
                latitude: latitude || undefined,
                longitude: longitude || undefined,
                opening_hours: filteredHours,
                social_icons_position: socialIconsPosition,
                welcome_popup_enabled: welcomePopupEnabled,
                welcome_popup_message: welcomePopupMessage,
                welcome_popup_delay: welcomePopupDelay,
                welcome_popup_show_button: welcomePopupShowButton,
                welcome_popup_show_info: welcomePopupShowInfo,
                event_announcements_enabled: eventAnnouncementsEnabled,
                event_announcement_days: eventAnnouncementDays,
                max_events_in_popup: maxEventsInPopup,
                event_rotation_speed: eventRotationSpeed,
            }

            setRestaurant(updatedRestaurant)

            toast.success("Profile updated", {
                description: "Your restaurant profile has been updated successfully",
            })
            setHasChanges(false)
        } catch (error: any) {
            toast.error("Error updating profile", {
                description: error.message || "An error occurred while updating your profile",
            })
        } finally {
            setSaving(false)
        }
    }

    const resetToDefaults = () => {
        const defaultData = mockRestaurant

        setName(defaultData.name)
        setSlug(defaultData.slug)
        setBio(defaultData.bio || "")
        setLogoUrl(defaultData.logo_url || "")
        setPhone(defaultData.phone || "")
        setEmail(defaultData.email || "")
        setAddress(defaultData.address || "")
        setInstagram(defaultData.instagram || "")
        setFacebook(defaultData.facebook || "")
        setWhatsapp(defaultData.whatsapp || "")
        setGooglePlaceId(defaultData.google_place_id || "")
        setLatitude(defaultData.latitude)
        setLongitude(defaultData.longitude)
        setSocialIconsPosition(defaultData.social_icons_position)

        setWelcomePopupEnabled(defaultData.welcome_popup_enabled)
        setWelcomePopupMessage(defaultData.welcome_popup_message)
        setWelcomePopupDelay(defaultData.welcome_popup_delay)
        setWelcomePopupShowButton(defaultData.welcome_popup_show_button)
        setWelcomePopupShowInfo(defaultData.welcome_popup_show_info)

        setEventAnnouncementsEnabled(defaultData.event_announcements_enabled)
        setEventAnnouncementDays(defaultData.event_announcement_days)
        setMaxEventsInPopup(defaultData.max_events_in_popup)
        setEventRotationSpeed(defaultData.event_rotation_speed)

        setOpeningHours(defaultData.opening_hours)

        setHasChanges(true)
        toast.success("Settings reset to defaults")
    }

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

    const handleInputChange = (setter: any, value: string | number) => {
        setter(value)
        setHasChanges(true)
    }

    const handlePopupInfoChange = (key: keyof typeof welcomePopupShowInfo, value: boolean) => {
        setWelcomePopupShowInfo((prev) => ({
            ...prev,
            [key]: value,
        }))
        setHasChanges(true)
    }

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
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
                    <span>Loading settings...</span>
                </div>
            </div>
        )
    }

    return (

        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-muted-foreground">Manage your restaurant profile and settings</p>
                <div className="mt-4 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToDefaults}
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                        Reset to Defaults
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                {/* Sidebar Navigation */}
                <div className="space-y-4">
                    {sections.map((section) => {
                        const Icon = section.icon
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between group ${activeSection === section.id
                                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                    : "hover:bg-gray-50 border border-transparent"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className={`h-5 w-5 ${activeSection === section.id ? "text-emerald-600" : "text-gray-500"}`}
                                    />
                                    <div>
                                        <div className="font-medium">{section.title}</div>
                                        <div className="text-sm text-muted-foreground">{section.description}</div>
                                    </div>
                                </div>
                                <ChevronRight
                                    className={`h-5 w-5 transition-transform ${activeSection === section.id
                                        ? "text-emerald-600 translate-x-1"
                                        : "text-gray-400 group-hover:translate-x-1"
                                        }`}
                                />
                            </button>
                        )
                    })}
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Business Information */}
                    <div className={activeSection === "business" ? "block" : "hidden"}>
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/50">
                                <CardTitle className="text-gray-900">Business Information</CardTitle>
                                <CardDescription>Update your restaurant&apos;s basic information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Restaurant Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => handleInputChange(setName, e.target.value)}
                                        placeholder="e.g. Trattoria Milano"
                                        required
                                        className="focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Page URL</Label>
                                    <div className="flex items-center">
                                        <span className="mr-2 text-muted-foreground">dineri.app/</span>
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => handleInputChange(setSlug, e.target.value)}
                                            placeholder="your-restaurant"
                                            required
                                            className="focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This will be the URL of your public page. Only use letters, numbers, and hyphens.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Short Description</Label>
                                    <Textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => handleInputChange(setBio, e.target.value)}
                                        placeholder="Tell customers about your restaurant in a few words (max 200 characters)"
                                        maxLength={200}
                                        rows={3}
                                        className="focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div className="text-right text-xs text-muted-foreground">{bio.length}/200 characters</div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo URL</Label>
                                    <Input
                                        id="logo"
                                        value={logoUrl}
                                        onChange={(e) => handleInputChange(setLogoUrl, e.target.value)}
                                        placeholder="https://example.com/your-logo.png"
                                        className="focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter a URL to your restaurant logo (image upload coming soon)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Information */}
                    <div className={activeSection === "contact" ? "block" : "hidden"}>
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/50">
                                <CardTitle className="text-gray-900">Contact Information</CardTitle>
                                <CardDescription>Add your contact details and location</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => handleInputChange(setPhone, e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                            className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => handleInputChange(setEmail, e.target.value)}
                                            placeholder="contact@example.com"
                                            className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <Textarea
                                            id="address"
                                            value={address}
                                            onChange={(e) => handleInputChange(setAddress, e.target.value)}
                                            placeholder="123 Restaurant Street, City, Country"
                                            rows={2}
                                            className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            value={latitude || ""}
                                            onChange={(e) =>
                                                handleInputChange(setLatitude, e.target.value ? Number.parseFloat(e.target.value) : "")
                                            }
                                            placeholder="e.g. 40.7128"
                                            className="focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            value={longitude || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    setLongitude,
                                                    e.target.value ? Number.parseFloat(e.target.value) : "",
                                                )
                                            }
                                            placeholder="e.g. -74.0060"
                                            className="focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* change-password Section */}
                    <div className={activeSection === "change-password" ? "block" : "hidden"}>
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/50">
                                <CardTitle className="text-gray-900">Edit Profile</CardTitle>
                                <CardDescription>Update your profile settings and password</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Change Password */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="old-password">Old Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="old-password"
                                                type="password"
                                                //   value={oldPassword}
                                                //   onChange={(e) => handleInputChange(setOldPassword, e.target.value)}
                                                placeholder="Enter your old password"
                                                className="focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="new-password"
                                                type="password"
                                                //   value={newPassword}
                                                //   onChange={(e) => handleInputChange(setNewPassword, e.target.value)}
                                                placeholder="Enter your new password"
                                                className="focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirm-new-password"
                                                type="password"
                                                //   value={confirmNewPassword}
                                                //   onChange={(e) => handleInputChange(setConfirmNewPassword, e.target.value)}
                                                placeholder="Confirm your new password"
                                                className="focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Button
                                            // onClick={handleChangePassword}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            Change Password
                                        </Button>
                                        <Button
                                            variant="link"
                                            //    onClick={handleForgotPassword} 
                                            className="text-emerald-600 hover:text-emerald-700">
                                            Forgot Password?
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Opening Hours */}
                    <div className={activeSection === "hours" ? "block" : "hidden"}>
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
                                                <Select
                                                    value={closeTime}
                                                    onValueChange={(value) => updateOpeningHours(index, "close", value)}
                                                >
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
                    </div>

                    {/* Social Media */}
                    <div className={activeSection === "social" ? "block" : "hidden"}>
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/50">
                                <CardTitle className="text-gray-900">Social Media</CardTitle>
                                <CardDescription>Connect your social media accounts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram Profile URL</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <Input
                                            id="instagram"
                                            value={instagram}
                                            onChange={(e) => handleInputChange(setInstagram, e.target.value)}
                                            placeholder="https://instagram.com/your.restaurant"
                                            className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook URL</Label>
                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <Input
                                            id="facebook"
                                            value={facebook}
                                            onChange={(e) => handleInputChange(setFacebook, e.target.value)}
                                            placeholder="https://facebook.com/your.restaurant"
                                            className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                                    <div className="relative">
                                        <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <Input
                                            id="whatsapp"
                                            value={whatsapp}
                                            onChange={(e) => handleInputChange(setWhatsapp, e.target.value)}
                                            placeholder="+1234567890"
                                            className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Enter your WhatsApp number with country code (e.g., +1234567890)
                                    </p>
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <Label>Social Icons Position</Label>
                                    <Select
                                        value={socialIconsPosition}
                                        onValueChange={(value: "top" | "bottom") => {
                                            setSocialIconsPosition(value)
                                            setHasChanges(true)
                                        }}
                                    >
                                        <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="top">Top</SelectItem>
                                            <SelectItem value="bottom">Below</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Popups Section */}
                    <div className={activeSection === "popups" ? "block" : "hidden"}>
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
                                                                    {restaurant?.name?.charAt(0) || "R"}
                                                                </span>
                                                            </div>
                                                            <h3 className="mb-2 text-lg font-bold">
                                                                Welcome to {restaurant?.name || "Your Restaurant"}!
                                                            </h3>
                                                            <p className="mb-4 text-sm text-gray-600">{welcomePopupMessage}</p>
                                                            <div className="space-y-2 text-xs text-gray-500">
                                                                {welcomePopupShowInfo.ratings && restaurant?.average_rating && (
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                        <span>
                                                                            {restaurant.average_rating.toFixed(1)} ({restaurant.review_count} reviews)
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {welcomePopupShowInfo.address && restaurant?.address && (
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <MapPinIcon className="h-3 w-3" />
                                                                        <span>{restaurant.address.split(",")[0]}</span>
                                                                    </div>
                                                                )}
                                                                {welcomePopupShowInfo.hours && (
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>Open Today</span>
                                                                    </div>
                                                                )}
                                                                {welcomePopupShowInfo.phone && restaurant?.phone && (
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <Phone className="h-3 w-3" />
                                                                        <span>{restaurant.phone}</span>
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
                                                <p className="text-xs text-muted-foreground">
                                                    Only show events happening within this time period
                                                </p>
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
                                                <p className="text-xs text-muted-foreground">
                                                    How many events to show at once (most urgent first)
                                                </p>
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
                                                                    {restaurant?.name?.charAt(0) || "R"}
                                                                </span>
                                                            </div>
                                                            <h3 className="mb-2 text-lg font-bold">
                                                                Welcome to {restaurant?.name || "Your Restaurant"}!
                                                            </h3>

                                                            {/* Mock Event */}
                                                            <div className="space-y-3">
                                                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>This Friday</span>
                                                                </div>

                                                                <h4 className="text-lg font-semibold text-gray-900">Live Jazz Night</h4>

                                                                <p className="text-sm text-gray-600">
                                                                    Join us for an evening of smooth jazz and great food
                                                                </p>

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
                    </div>

                    {/* Integrations */}
                    <div className={activeSection === "integrations" ? "block" : "hidden"}>
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/50">
                                <CardTitle className="text-gray-900">Google Places Integration</CardTitle>
                                <CardDescription>Connect your Google Places listing to show ratings and reviews</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="googlePlaceId">Google Place ID</Label>
                                    <div className="relative">
                                        <Globe2 className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                        <Input
                                            id="googlePlaceId"
                                            value={googlePlaceId}
                                            onChange={(e) => handleInputChange(setGooglePlaceId, e.target.value)}
                                            placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                                            className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Find your Place ID using the{" "}
                                        <a
                                            href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerald-600 hover:underline"
                                        >
                                            Place ID Finder
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
        </main>
    )
}
