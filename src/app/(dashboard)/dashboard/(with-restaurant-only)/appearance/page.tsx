"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplatesSection } from "./templates"
import { toast } from "sonner"
import {
    Paintbrush,
    Type,
    Layout,
    Palette,
    Signal,
    Battery,
    Wifi,
    Instagram,
    Calendar,
    MapPin,
    MenuIcon,
    ExternalLink,
    ImageIcon,
    Facebook,
} from "lucide-react"
import { DashboardHeader } from "../../../_components/header"

// Define types
interface Restaurant {
    id: string
    user_id: string
    name: string
    bio: string
    logo_url: string | null
    bg_color: string
    accent_color: string
    bg_type: "color" | "gradient" | "image"
    bg_gradient_start: string
    bg_gradient_end: string
    gradient_direction: string
    button_style: "rounded" | "square" | "pill"
    button_variant: "solid" | "outline"
    font_family: string
    slug: string
    created_at: string
    subscription_plan: string
    subscription_status: string
    instagram?: string
    facebook?: string
    bg_image_url?: string
}

interface RestaurantLink {
    id: string
    restaurant_id: string
    title: string
    url: string
    sort_order: number
    clicks: number
    created_at: string
}

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

// Font options
const fonts = [
    { name: "Inter", value: "Inter", preview: "Modern and clean" },
    { name: "Helvetica", value: "Helvetica Neue", preview: "Classic and versatile" },
    { name: "Roboto", value: "Roboto", preview: "Professional and readable" },
    { name: "SF Pro", value: "SF Pro Display", preview: "Elegant and refined" },
    { name: "Playfair Display", value: "Playfair Display", preview: "Sophisticated and luxurious" },
]

// Gradient presets
const gradientPresets = [
    { name: "Teal", start: "#0d9488", end: "#0891b2" },
    { name: "Blue", start: "#0369a1", end: "#0284c7" },
    { name: "Sunset", start: "#b91c1c", end: "#dc2626" },
    { name: "Purple", start: "#6d28d9", end: "#7c3aed" },
    { name: "Night", start: "#1e293b", end: "#334155" },
]

// Gradient directions
const gradientDirections = [
    { value: "bottom", label: "Bottom", preview: "Top to Bottom" },
    { value: "top", label: "Top", preview: "Bottom to Top" },
    { value: "right", label: "Right", preview: "Left to Right" },
    { value: "left", label: "Left", preview: "Right to Left" },
    { value: "bottom-right", label: "Bottom Right", preview: "Top Left to Bottom Right" },
    { value: "bottom-left", label: "Bottom Left", preview: "Top Right to Bottom Left" },
    { value: "top-right", label: "Top Right", preview: "Bottom Left to Top Right" },
    { value: "top-left", label: "Top Left", preview: "Bottom Right to Top Left" },
]

// Accent color presets
const accentPresets = [
    { name: "Teal", color: "#0d9488" },
    { name: "Blue", color: "#3b82f6" },
    { name: "Red", color: "#ef4444" },
    { name: "Purple", color: "#8b5cf6" },
    { name: "Orange", color: "#f97316" },
]

// Dummy restaurant data
const dummyRestaurant: Restaurant = {
    id: "2",
    user_id: "dummy-user-2",
    name: "Bistro Delight",
    bio: "Casual and cozy bistro serving fresh, locally-sourced ingredients with a modern twist on classic favorites.",
    logo_url: null,
    bg_color: "#ffffff",
    accent_color: "#0ea5e9",
    bg_type: "gradient",
    bg_gradient_start: "#f8fafc",
    bg_gradient_end: "#f1f5f9",
    gradient_direction: "bottom-right",
    button_style: "rounded",
    button_variant: "solid",
    font_family: "Inter",
    slug: "bistro-delight",
    created_at: new Date().toISOString(),
    subscription_plan: "free",
    subscription_status: "active",
    instagram: "https://instagram.com/bistrodelight",
    facebook: "https://facebook.com/bistrodelight",
}

// Dummy links data
const dummyLinks: RestaurantLink[] = [
    {
        id: "1",
        restaurant_id: "2",
        title: "View Our Menu",
        url: "https://example.com/menu",
        sort_order: 1,
        clicks: 42,
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        restaurant_id: "2",
        title: "Make a Reservation",
        url: "https://example.com/reservation",
        sort_order: 2,
        clicks: 28,
        created_at: new Date().toISOString(),
    },
    {
        id: "3",
        restaurant_id: "2",
        title: "Follow us on Instagram",
        url: "https://instagram.com/bistrodelight",
        sort_order: 3,
        clicks: 15,
        created_at: new Date().toISOString(),
    },
    {
        id: "4",
        restaurant_id: "2",
        title: "Get Directions",
        url: "https://maps.google.com",
        sort_order: 4,
        clicks: 19,
        created_at: new Date().toISOString(),
    },
]

export default function AppearancePage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [links, setLinks] = useState<RestaurantLink[]>([])
    const [bgType, setBgType] = useState<"color" | "gradient" | "image">("color")
    const [bgColor, setBgColor] = useState("#ffffff")
    const [bgGradientStart, setBgGradientStart] = useState("#ffffff")
    const [bgGradientEnd, setBgGradientEnd] = useState("#f3f4f6")
    const [gradientDirection, setGradientDirection] = useState<string>("bottom-right")
    const [accentColor, setAccentColor] = useState("#0ea5e9")
    const [buttonStyle, setButtonStyle] = useState<"rounded" | "square" | "pill">("rounded")
    const [buttonVariant, setButtonVariant] = useState<"solid" | "outline">("solid")
    const [fontFamily, setFontFamily] = useState("Inter")
    const [customBgUrl, setCustomBgUrl] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [currentTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setRestaurant(dummyRestaurant)
            setLinks(dummyLinks)
            setBgType(dummyRestaurant.bg_type || "color")
            setBgColor(dummyRestaurant.bg_color || "#ffffff")
            setBgGradientStart(dummyRestaurant.bg_gradient_start || "#ffffff")
            setBgGradientEnd(dummyRestaurant.bg_gradient_end || "#f3f4f6")
            setGradientDirection(dummyRestaurant.gradient_direction || "bottom-right")
            setAccentColor(dummyRestaurant.accent_color || "#0ea5e9")
            setButtonStyle(dummyRestaurant.button_style || "rounded")
            setButtonVariant(dummyRestaurant.button_variant || "solid")
            setFontFamily(dummyRestaurant.font_family || "Inter")
            setCustomBgUrl(dummyRestaurant.bg_image_url || "")
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    const saveChanges = async () => {
        if (!restaurant) return

        try {
            setSaving(true)

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Update the restaurant object with new values
            const updatedRestaurant = {
                ...restaurant,
                bg_type: bgType,
                bg_color: bgColor,
                bg_gradient_start: bgGradientStart,
                bg_gradient_end: bgGradientEnd,
                gradient_direction: gradientDirection,
                accent_color: accentColor,
                button_style: buttonStyle,
                button_variant: buttonVariant,
                font_family: fontFamily,
                bg_image_url: bgType === "image" ? customBgUrl : undefined,
            }

            setRestaurant(updatedRestaurant)

            toast("Changes saved successfully")
        } catch {
            toast("Error saving changes: " + ("An unknown error occurred"))
        } finally {
            setSaving(false)
        }
    }

    const getIconForLink = (title: string) => {
        const lowerTitle = title.toLowerCase()

        if (lowerTitle.includes("instagram") || lowerTitle.includes("follow")) return <Instagram className="h-4 w-4" />
        if (lowerTitle.includes("reservation") || lowerTitle.includes("book")) return <Calendar className="h-4 w-4" />
        if (lowerTitle.includes("direction") || lowerTitle.includes("location")) return <MapPin className="h-4 w-4" />
        if (lowerTitle.includes("menu")) return <MenuIcon className="h-4 w-4" />

        return <ExternalLink className="h-4 w-4" />
    }

    const getBackgroundStyle = () => {
        if (bgType === "image" && customBgUrl) {
            return {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${customBgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }
        }

        if (bgType === "gradient" && bgGradientStart && bgGradientEnd) {
            return {
                backgroundImage: `linear-gradient(${gradientDirection === "top"
                    ? "to top"
                    : gradientDirection === "bottom"
                        ? "to bottom"
                        : gradientDirection === "left"
                            ? "to left"
                            : gradientDirection === "right"
                                ? "to right"
                                : gradientDirection === "top-right"
                                    ? "to top right"
                                    : gradientDirection === "top-left"
                                        ? "to top left"
                                        : gradientDirection === "bottom-right"
                                            ? "to bottom right"
                                            : gradientDirection === "bottom-left"
                                                ? "to bottom left"
                                                : "to bottom right"
                    }, ${bgGradientStart}, ${bgGradientEnd})`,
            }
        }

        return { backgroundColor: bgColor || "#ffffff" }
    }

    const textColor = bgType === "image" ? "#ffffff" : bgColor === "#ffffff" ? "#000000" : "#ffffff"

    const textColorWithOpacity =
        bgType === "image" ? "rgba(255,255,255,0.9)" : bgColor === "#ffffff" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)"

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <DashboardHeader />
                <div className="max-w-[1200px] mx-auto px-4 py-16 flex justify-center">
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
                        <span>Loading appearance settings...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                        Appearance
                    </h1>
                    <p className="text-slate-500 mt-1">Customize how your restaurant page looks</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Tabs defaultValue="templates" className="space-y-6">
                            <TabsList className="grid grid-cols-4 gap-4">
                                <TabsTrigger value="templates" className="flex items-center gap-2">
                                    <Layout className="h-4 w-4" />
                                    <span>Templates</span>
                                </TabsTrigger>
                                <TabsTrigger value="style" className="flex items-center gap-2">
                                    <Paintbrush className="h-4 w-4" />
                                    <span>Style</span>
                                </TabsTrigger>
                                <TabsTrigger value="colors" className="flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    <span>Colors</span>
                                </TabsTrigger>
                                <TabsTrigger value="typography" className="flex items-center gap-2">
                                    <Type className="h-4 w-4" />
                                    <span>Typography</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="templates">
                                <TemplatesSection />
                            </TabsContent>

                            <TabsContent value="style">
                                <Card className="border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900">Button Style</CardTitle>
                                        <CardDescription className="text-slate-500">Choose how your buttons should look</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-slate-700">Shape</Label>
                                            <RadioGroup
                                                value={buttonStyle}
                                                onValueChange={(value: string) => setButtonStyle(value as "rounded" | "square" | "pill")}
                                                className="grid grid-cols-3 gap-4"
                                            >
                                                <div>
                                                    <RadioGroupItem value="rounded" id="rounded" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="rounded"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-10 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 mb-2"></div>
                                                        <span className="text-slate-700">Rounded</span>
                                                    </Label>
                                                </div>

                                                <div>
                                                    <RadioGroupItem value="square" id="square" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="square"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-10 rounded-md bg-gradient-to-r from-teal-600 to-blue-600 mb-2"></div>
                                                        <span className="text-slate-700">Square</span>
                                                    </Label>
                                                </div>

                                                <div>
                                                    <RadioGroupItem value="pill" id="pill" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="pill"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-10 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 mb-2"></div>
                                                        <span className="text-slate-700">Pill</span>
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-slate-700">Style</Label>
                                            <RadioGroup
                                                value={buttonVariant}
                                                onValueChange={(value: string) => setButtonVariant(value as "solid" | "outline")}
                                                className="grid grid-cols-2 gap-4"
                                            >
                                                <div>
                                                    <RadioGroupItem value="solid" id="solid" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="solid"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-10 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 mb-2"></div>
                                                        <span className="text-slate-700">Solid</span>
                                                    </Label>
                                                </div>

                                                <div>
                                                    <RadioGroupItem value="outline" id="outline" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="outline"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-10 rounded-xl bg-white border-2 border-teal-600 mb-2"></div>
                                                        <span className="text-slate-700">Outline</span>
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="colors">
                                <div className="space-y-6">
                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle className="text-slate-900">Background</CardTitle>
                                            <CardDescription className="text-slate-500">
                                                Choose between a solid color, gradient, or custom image background
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <RadioGroup
                                                value={bgType}
                                                onValueChange={(value: string) => setBgType(value as "color" | "gradient" | "image")}
                                                className="grid grid-cols-3 gap-4"
                                            >
                                                <div>
                                                    <RadioGroupItem value="color" id="color" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="color"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-16 rounded bg-teal-600 mb-2"></div>
                                                        <span className="text-slate-700">Solid Color</span>
                                                    </Label>
                                                </div>

                                                <div>
                                                    <RadioGroupItem value="gradient" id="gradient" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="gradient"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-16 rounded bg-gradient-to-r from-teal-500 to-blue-500 mb-2"></div>
                                                        <span className="text-slate-700">Gradient</span>
                                                    </Label>
                                                </div>

                                                <div>
                                                    <RadioGroupItem value="image" id="image" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="image"
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                    >
                                                        <div className="w-full h-16 rounded bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center mb-2">
                                                            <ImageIcon className="h-6 w-6 text-slate-400" />
                                                        </div>
                                                        <span className="text-slate-700">Image</span>
                                                    </Label>
                                                </div>
                                            </RadioGroup>

                                            {bgType === "color" && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">Background Color</Label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 rounded border" style={{ backgroundColor: bgColor }} />
                                                            <Input
                                                                type="color"
                                                                value={bgColor}
                                                                onChange={(e) => setBgColor(e.target.value)}
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {bgType === "gradient" && (
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <Label className="text-slate-700">Gradient Presets</Label>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {gradientPresets.map((preset) => (
                                                                <button
                                                                    key={preset.name}
                                                                    onClick={() => {
                                                                        setBgGradientStart(preset.start)
                                                                        setBgGradientEnd(preset.end)
                                                                    }}
                                                                    className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 ring-offset-2 ring-teal-600 transition-all"
                                                                    style={{
                                                                        background: `linear-gradient(to bottom right, ${preset.start}, ${preset.end})`,
                                                                    }}
                                                                    title={preset.name}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label className="text-slate-700">Gradient Direction</Label>
                                                        <Select value={gradientDirection} onValueChange={setGradientDirection}>
                                                            <SelectTrigger className="border-slate-200">
                                                                <SelectValue placeholder="Select direction" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {gradientDirections.map((direction) => (
                                                                    <SelectItem key={direction.value} value={direction.value}>
                                                                        <div className="flex flex-col">
                                                                            <span>{direction.label}</span>
                                                                            <span className="text-xs text-slate-500">{direction.preview}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-700">Start Color</Label>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-10 h-10 rounded border"
                                                                    style={{ backgroundColor: bgGradientStart }}
                                                                />
                                                                <Input
                                                                    type="color"
                                                                    value={bgGradientStart}
                                                                    onChange={(e) => setBgGradientStart(e.target.value)}
                                                                    className="flex-1"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-slate-700">End Color</Label>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-10 h-10 rounded border" style={{ backgroundColor: bgGradientEnd }} />
                                                                <Input
                                                                    type="color"
                                                                    value={bgGradientEnd}
                                                                    onChange={(e) => setBgGradientEnd(e.target.value)}
                                                                    className="flex-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {bgType === "image" && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">Image URL</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="url"
                                                                value={customBgUrl}
                                                                onChange={(e) => setCustomBgUrl(e.target.value)}
                                                                placeholder="https://example.com/background.jpg"
                                                                className="flex-1 border-slate-200"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            Enter the URL of your background image. For best results, use an image at least
                                                            1920x1080px.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle className="text-slate-900">Accent Color</CardTitle>
                                            <CardDescription className="text-slate-500">
                                                This color will be used for buttons and highlights
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-4">
                                                <Label className="text-slate-700">Color Presets</Label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {accentPresets.map((preset) => (
                                                        <button
                                                            key={preset.name}
                                                            onClick={() => setAccentColor(preset.color)}
                                                            className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 ring-offset-2 ring-teal-600 transition-all"
                                                            style={{ backgroundColor: preset.color }}
                                                            title={preset.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-slate-700">Custom Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded border" style={{ backgroundColor: accentColor }} />
                                                    <Input
                                                        type="color"
                                                        value={accentColor}
                                                        onChange={(e) => setAccentColor(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="typography">
                                <Card className="border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900">Font Selection</CardTitle>
                                        <CardDescription className="text-slate-500">Choose the font for your page</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <Select value={fontFamily} onValueChange={setFontFamily}>
                                                <SelectTrigger className="border-slate-200">
                                                    <SelectValue placeholder="Select a font" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fonts.map((font) => (
                                                        <SelectItem key={font.value} value={font.value}>
                                                            <div className="flex flex-col">
                                                                <span style={{ fontFamily: font.value }}>{font.name}</span>
                                                                <span className="text-xs text-slate-500">{font.preview}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <div className="space-y-4">
                                                <Label className="text-slate-700">Preview</Label>
                                                <div className="p-4 rounded-lg bg-slate-100" style={{ fontFamily }}>
                                                    <p className="text-2xl font-bold mb-2 text-slate-900">The quick brown fox</p>
                                                    <p className="text-slate-600">
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                                                        labore et dolore magna aliqua.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <Button
                            onClick={saveChanges}
                            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>

                    <div className="lg:sticky lg:top-24 space-y-6">
                        <Card className="overflow-hidden border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">Live Preview</CardTitle>
                                <CardDescription className="text-slate-500">See how your page looks on mobile devices</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="mx-auto max-w-[300px] p-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-teal-500/20 to-blue-500/20 blur-xl opacity-30 scale-105 translate-y-2"></div>

                                        <div className="relative rounded-[2rem] bg-black overflow-hidden shadow-[0_0_0_12px_rgba(0,0,0,0.8)]">
                                            <div className="absolute -right-[2px] top-16 w-[3px] h-12 bg-gray-800 rounded-l-lg"></div>
                                            <div className="absolute -left-[2px] top-20 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>
                                            <div className="absolute -left-[2px] top-28 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>

                                            <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                                                <div className="w-[84px] h-[32px] bg-black rounded-b-[18px] flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] ring-[3px] ring-[#121212] absolute left-4"></div>
                                                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a] absolute right-4"></div>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex items-center justify-between text-white px-4 pt-2 text-[12px] font-medium">
                                                <span>{currentTime}</span>
                                                <div className="flex items-center gap-1">
                                                    <Signal className="h-3 w-3" />
                                                    <Wifi className="h-3 w-3" />
                                                    <Battery className="h-3 w-3" />
                                                </div>
                                            </div>

                                            <div className="mt-1">
                                                <div className="min-h-[480px]" style={getBackgroundStyle()}>
                                                    <div className="p-4 flex flex-col items-center">
                                                        {restaurant?.logo_url ? (
                                                            <motion.img
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                                src={restaurant.logo_url}
                                                                alt={restaurant.name}
                                                                className="w-16 h-16 rounded-full object-cover mb-3 shadow-lg ring-4 ring-black/10"
                                                            />
                                                        ) : (
                                                            <motion.div
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                                className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ring-4 ring-black/10"
                                                                style={{ backgroundColor: accentColor }}
                                                            >
                                                                <span className="text-xl font-bold text-white">{restaurant?.name.charAt(0)}</span>
                                                            </motion.div>
                                                        )}

                                                        <motion.h2
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="text-lg font-bold mb-1"
                                                            style={{
                                                                color: textColor,
                                                                fontFamily,
                                                            }}
                                                        >
                                                            {restaurant?.name}
                                                        </motion.h2>

                                                        {restaurant?.bio && (
                                                            <motion.p
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{ delay: 0.3 }}
                                                                className="text-xs opacity-90 text-center"
                                                                style={{
                                                                    color: textColorWithOpacity,
                                                                    fontFamily,
                                                                }}
                                                            >
                                                                {restaurant.bio}
                                                            </motion.p>
                                                        )}

                                                        {(restaurant?.instagram || restaurant?.facebook) && (
                                                            <motion.div
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{ delay: 0.4 }}
                                                                className="flex items-center justify-center gap-4 mb-6 mt-4"
                                                            >
                                                                {restaurant.instagram && (
                                                                    <a
                                                                        href={restaurant.instagram}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
                                                                        style={{ color: accentColor }}
                                                                    >
                                                                        <Instagram className="h-5 w-5" />
                                                                    </a>
                                                                )}
                                                                {restaurant.facebook && (
                                                                    <a
                                                                        href={restaurant.facebook}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
                                                                        style={{ color: accentColor }}
                                                                    >
                                                                        <Facebook className="h-5 w-5" />
                                                                    </a>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    <motion.div variants={container} initial="hidden" animate="show" className="px-3 space-y-2">
                                                        {links.length > 0 ? (
                                                            links.map((link) => (
                                                                <motion.div
                                                                    key={link.id}
                                                                    variants={item}
                                                                    className={`flex items-center gap-2 p-3 w-full transition-all hover:scale-[1.02] active:scale-[0.98] ${buttonStyle === "pill"
                                                                        ? "rounded-full"
                                                                        : buttonStyle === "square"
                                                                            ? "rounded-md"
                                                                            : "rounded-xl"
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            buttonVariant === "solid" ? "rgba(255, 255, 255, 0.9)" : "transparent",
                                                                        backdropFilter: "blur(8px)",
                                                                        border: `2px solid ${accentColor}`,
                                                                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                                                                        color: buttonVariant === "solid" ? "inherit" : accentColor,
                                                                        fontFamily,
                                                                    }}
                                                                >
                                                                    <span style={{ color: accentColor }}>{getIconForLink(link.title)}</span>
                                                                    <span className="font-medium text-xs">{link.title}</span>
                                                                </motion.div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6">
                                                                <p className="text-slate-500 text-xs">No links added yet</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </div>

                                                <div className="absolute bottom-1 inset-x-0 flex justify-center pb-1">
                                                    <div className="w-[100px] h-1 bg-white/30 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
