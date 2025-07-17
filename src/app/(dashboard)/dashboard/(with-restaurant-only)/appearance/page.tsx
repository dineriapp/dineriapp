"use client"

import { ColorSelector } from "@/app/(dashboard)/_components/color-selection"
import { GoogleRating } from "@/app/[slug]/_components/google-rating"
import { OpeningHoursStatus } from "@/app/[slug]/_components/opening-hours-status"
import SocialIcons from "@/components/social-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLucideIconBySlug } from "@/lib/get-icons"
import { useLinks } from "@/lib/link-queries"
import { useGoogleReviews } from "@/lib/review-api"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { OpeningHoursData } from "@/types"
import { GradientDirection } from "@prisma/client"
import {
    Battery,
    ImageIcon,
    MoreVertical,
    Paintbrush,
    Palette,
    RotateCcw,
    Signal,
    Sparkles,
    Type,
    Wifi
} from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Define types based on Prisma schema
interface AppearanceFormData {
    bg_color: string
    accent_color: string
    headings_text_color: string
    button_text_icons_color: string
    button_style: "rounded" | "square" | "pill"
    font_family: string
    bg_type: "color" | "gradient" | "image"
    bg_gradient_start: string
    social_icon_bg_color: string
    social_icon_color: string
    button_icons_show: boolean
    buttons_gap_in_px: number
    social_icon_gap: number
    social_icon_bg_show: boolean
    bg_gradient_end: string
    gradient_direction: GradientDirection
    button_variant: "solid" | "outline"
    bg_image_url?: string
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
    { value: "bottom_right", label: "Bottom Right", preview: "Top Left to Bottom Right" },
    { value: "bottom_left", label: "Bottom Left", preview: "Top Right to Bottom Left" },
    { value: "top_right", label: "Top Right", preview: "Bottom Left to Top Right" },
    { value: "top_left", label: "Top Left", preview: "Bottom Right to Top Left" },
]

// Color presets
const colorPresets = [
    { name: "Teal", color: "#0d9488" },
    { name: "Blue", color: "#3b82f6" },
    { name: "Red", color: "#ef4444" },
    { name: "Purple", color: "#8b5cf6" },
    { name: "Orange", color: "#f97316" },
    { name: "Green", color: "#22c55e" },
    { name: "Pink", color: "#ec4899" },
    { name: "Yellow", color: "#eab308" },
]

// Text color presets
const textColorPresets = [
    { name: "White", color: "#ffffff" },
    { name: "Black", color: "#000000" },
    { name: "Gray Dark", color: "#374151" },
    { name: "Gray Light", color: "#9ca3af" },
]

// Template interface
interface Template {
    id: string
    name: string
    description: string
    preview: AppearanceFormData
    category: string
}

// Design templates
const templates: Template[] = [
    {
        id: "classic-elegant",
        name: "Classic Elegant",
        description: "Sophisticated dark theme with gold accents",
        category: "Premium",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#1a1a1a",
            bg_gradient_end: "#2d2d2d",
            gradient_direction: "bottom_right",
            bg_color: "#1a1a1a",
            social_icon_bg_color: "#d4af37",
            social_icon_color: "#000000",
            social_icon_bg_show: true,
            accent_color: "#d4af37",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            headings_text_color: "#ffffff",
            button_icons_show: true,
            button_text_icons_color: "#000000",
            button_style: "rounded",
            button_variant: "solid",
            font_family: "Playfair Display",
            bg_image_url: "",
        }
    },
    {
        id: "modern-minimalist",
        name: "Modern Minimalist",
        description: "Clean and simple with subtle gradients",
        category: "Modern",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#f8fafc",
            bg_gradient_end: "#e2e8f0",
            social_icon_bg_color: "#000000",
            social_icon_color: "#000000",
            gradient_direction: "bottom",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            social_icon_bg_show: false,
            bg_color: "#ffffff",
            accent_color: "#0f172a",
            button_icons_show: true,
            headings_text_color: "#1e293b",
            button_text_icons_color: "#ffffff",
            button_style: "square",
            button_variant: "solid",
            font_family: "Inter",
            bg_image_url: "",
        }
    },
    {
        id: "warm-cozy",
        name: "Warm & Cozy",
        description: "Inviting warm colors perfect for cafes",
        category: "Cozy",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#fef3c7",
            bg_gradient_end: "#fed7aa",
            button_icons_show: true,
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            social_icon_bg_show: false,
            gradient_direction: "bottom_right",
            bg_color: "#fef3c7",
            social_icon_bg_color: "#000000",
            social_icon_color: "#c2410c",
            accent_color: "#c2410c",
            headings_text_color: "#7c2d12",
            button_text_icons_color: "#ffffff",
            button_style: "pill",
            button_variant: "solid",
            font_family: "Roboto",
            bg_image_url: "",
        }
    },
    {
        id: "ocean-fresh",
        name: "Ocean Fresh",
        description: "Cool blues and teals for seafood restaurants",
        category: "Fresh",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#0891b2",
            bg_gradient_end: "#0d9488",
            social_icon_bg_show: false,
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            social_icon_color: "#FFFFFF",
            social_icon_bg_color: "#000000",
            button_icons_show: true,
            gradient_direction: "bottom_left",
            bg_color: "#0891b2",
            accent_color: "#ffffff",
            headings_text_color: "#ffffff",
            button_text_icons_color: "#0d9488",
            button_style: "rounded",
            button_variant: "solid",
            font_family: "SF Pro Display",
            bg_image_url: "",
        }
    },
    {
        id: "sunset-vibes",
        name: "Sunset Vibes",
        description: "Vibrant sunset colors for energetic venues",
        category: "Vibrant",
        preview: {
            bg_type: "gradient",
            social_icon_bg_color: "#000000",
            social_icon_color: "#FFFFFF",
            bg_gradient_start: "#f97316",
            bg_gradient_end: "#dc2626",
            gradient_direction: "top_right",
            social_icon_bg_show: false,
            bg_color: "#f97316",
            accent_color: "#ffffff",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            button_icons_show: true,
            headings_text_color: "#ffffff",
            button_text_icons_color: "#dc2626",
            button_style: "pill",
            button_variant: "solid",
            font_family: "Helvetica Neue",
            bg_image_url: "",
        }
    },
    {
        id: "forest-green",
        name: "Forest Green",
        description: "Natural green theme for organic restaurants",
        category: "Natural",
        preview: {
            social_icon_bg_color: "#000000",
            social_icon_color: "#FFFFFF",
            bg_type: "gradient",
            bg_gradient_start: "#166534",
            bg_gradient_end: "#15803d",
            social_icon_bg_show: false,
            button_icons_show: true,
            gradient_direction: "bottom",
            bg_color: "#166534",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            accent_color: "#fbbf24",
            headings_text_color: "#ffffff",
            button_text_icons_color: "#166534",
            button_style: "rounded",
            button_variant: "solid",
            font_family: "Inter",
            bg_image_url: "",
        }
    }
]


export default function AppearancePage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
    const { data: links = [], isLoading: linksLoading, } = useLinks(selectedRestaurant?.id)
    const { data: reviewData, isLoading: reviewLoading } = useGoogleReviews(selectedRestaurant?.google_place_id);

    // Form state
    const [formData, setFormData] = useState<AppearanceFormData>({
        bg_color: "#ffffff",
        accent_color: "#10b981",
        headings_text_color: "#ffffff",
        button_text_icons_color: "#000000",
        button_style: "rounded",
        font_family: "Inter",
        bg_type: "color",
        button_icons_show: true,
        social_icon_bg_show: false,
        social_icon_bg_color: "#FFFFFF",
        social_icon_color: "#000000",
        buttons_gap_in_px: 16,
        social_icon_gap: 12,
        bg_gradient_start: "#ffffff",
        bg_gradient_end: "#f3f4f6",
        gradient_direction: "bottom_right",
        button_variant: "solid",
        bg_image_url: "",
    })

    // Initial form data for reset functionality
    const [initialData, setInitialData] = useState<AppearanceFormData>(formData)

    // UI state
    const [saving, setSaving] = useState(false)
    const [currentTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

    // Load initial data from restaurant store
    useEffect(() => {
        if (selectedRestaurant) {
            const initialFormData: AppearanceFormData = {
                bg_color: selectedRestaurant.bg_color || "#ffffff",
                accent_color: selectedRestaurant.accent_color || "#10b981",
                headings_text_color: selectedRestaurant.headings_text_color || "#ffffff",
                button_text_icons_color: selectedRestaurant.button_text_icons_color || "#000000",
                button_style: selectedRestaurant.button_style || "rounded",
                font_family: selectedRestaurant.font_family || "Inter",
                bg_type: selectedRestaurant.bg_type || "color",
                button_icons_show: selectedRestaurant.button_icons_show,
                buttons_gap_in_px: selectedRestaurant.buttons_gap_in_px,
                social_icon_bg_show: selectedRestaurant.social_icon_bg_show,
                social_icon_bg_color: selectedRestaurant.social_icon_bg_color,
                social_icon_color: selectedRestaurant.social_icon_color,
                social_icon_gap: selectedRestaurant.social_icon_gap,
                bg_gradient_start: selectedRestaurant.bg_gradient_start || "#ffffff",
                bg_gradient_end: selectedRestaurant.bg_gradient_end || "#f3f4f6",
                gradient_direction: selectedRestaurant.gradient_direction || "bottom_right",
                button_variant: selectedRestaurant.button_variant || "solid",
                bg_image_url: selectedRestaurant.bg_image_url || "",
            }

            setFormData(initialFormData)
            setInitialData(initialFormData)
        }
    }, [selectedRestaurant])

    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

    // Update form data
    const updateFormData = (updates: Partial<AppearanceFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }))
    }

    // Reset form to initial state
    const resetForm = () => {
        setFormData(initialData)
        toast.success("Form reset to original values")
    }

    // Save changes
    const saveChanges = async () => {
        if (!selectedRestaurant) return

        try {
            setSaving(true)

            const response = await fetch(`/api/restaurants/${selectedRestaurant.id}/appearance`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to save appearance settings")
            }

            const result = await response.json()

            // Update restaurant store with new data
            updateSelectedRestaurant(result.data)

            // Update initial data to reflect saved state
            setInitialData(formData)

            toast.success("Appearance settings saved successfully!")
        } catch (error) {
            console.error("Error saving appearance:", error)
            toast.error(error instanceof Error ? error.message : "Failed to save appearance settings")
        } finally {
            setSaving(false)
        }
    }

    // const SocialIcons = memo(() => {
    //     return <div
    //         // initial={{ y: 20, opacity: 0 }}
    //         // animate={{ y: 0, opacity: 1 }}
    //         // transition={{ delay: 0.4 }}
    //         className="mb-4 flex flex-wrap items-center justify-center gap-3"
    //     >
    //         {selectedRestaurant?.instagram && (
    //             <a
    //                 href={selectedRestaurant?.instagram}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 className={`p-2 rounded-full  backdrop-blur-sm  transition-transform hover:scale-110 ${formData.social_icon_bg_show && "shadow-md"}`}
    //                 style={{ color: formData?.accent_color || "#10b981", backgroundColor: formData.social_icon_bg_show ? "white" : "transparent" }}
    //             >
    //                 <Instagram className="h-6 w-6" />
    //             </a>
    //         )}
    //         {selectedRestaurant?.facebook && (
    //             <a
    //                 href={selectedRestaurant?.facebook}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 className={`p-2 rounded-full  backdrop-blur-sm  transition-transform hover:scale-110 ${formData.social_icon_bg_show && "shadow-md"}`}
    //                 style={{ color: formData?.accent_color || "#10b981", backgroundColor: formData.social_icon_bg_show ? "white" : "transparent" }}
    //             >
    //                 <Facebook className="h-6 w-6" />
    //             </a>
    //         )}
    //         {selectedRestaurant?.whatsapp && (
    //             <a
    //                 href={`https://wa.me/${selectedRestaurant?.whatsapp.replace(/\D/g, "")}`}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 className={`p-2 rounded-full  backdrop-blur-sm  transition-transform hover:scale-110 ${formData.social_icon_bg_show && "shadow-md"}`}
    //                 style={{ color: formData?.accent_color || "#10b981", backgroundColor: formData.social_icon_bg_show ? "white" : "transparent" }}
    //             >
    //                 <MessageCircle className="h-6 w-6" />
    //             </a>
    //         )}
    //         {selectedRestaurant?.email && (
    //             <a
    //                 href={`mailto:${selectedRestaurant?.email}`}
    //                 className={`p-2 rounded-full  backdrop-blur-sm  transition-transform hover:scale-110 ${formData.social_icon_bg_show && "shadow-md"}`}
    //                 style={{ color: formData?.accent_color || "#10b981", backgroundColor: formData.social_icon_bg_show ? "white" : "transparent" }}
    //             >
    //                 <Mail className="h-6 w-6" />
    //             </a>
    //         )}
    //         {selectedRestaurant?.address && (
    //             <a
    //                 href={`https://maps.google.com/?q=${encodeURIComponent(selectedRestaurant?.address)}`}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 className={`p-2 rounded-full  backdrop-blur-sm  transition-transform hover:scale-110 ${formData.social_icon_bg_show && "shadow-md"}`}
    //                 style={{ color: formData?.accent_color || "#10b981", backgroundColor: formData.social_icon_bg_show ? "white" : "transparent" }}
    //             >
    //                 <MapPin className="h-6 w-6" />
    //             </a>
    //         )}
    //     </div>
    // },
    // )

    // SocialIcons.displayName = "SocialIcons";


    // const getIconForLink = (title: string) => {
    //     const lowerTitle = title.toLowerCase()

    //     if (lowerTitle.includes("instagram") || lowerTitle.includes("follow")) return <Instagram className="h-4 w-4" />
    //     if (lowerTitle.includes("reservation") || lowerTitle.includes("book")) return <Calendar className="h-4 w-4" />
    //     if (lowerTitle.includes("direction") || lowerTitle.includes("location")) return <MapPin className="h-4 w-4" />
    //     if (lowerTitle.includes("menu")) return <MenuIcon className="h-4 w-4" />

    //     return <ExternalLink className="h-4 w-4" />
    // }

    const getBackgroundStyle = () => {
        if (formData.bg_type === "image" && formData.bg_image_url) {
            return {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${formData.bg_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }
        }

        if (formData.bg_type === "gradient" && formData.bg_gradient_start && formData.bg_gradient_end) {
            const directionMap: Record<string, string> = {
                top: "to top",
                bottom: "to bottom",
                left: "to left",
                right: "to right",
                "top-right": "to top right",
                "top-left": "to top left",
                "bottom-right": "to bottom right",
                "bottom-left": "to bottom left",
            }

            return {
                backgroundImage: `linear-gradient(${directionMap[formData.gradient_direction] || "to bottom right"}, ${formData.bg_gradient_start}, ${formData.bg_gradient_end})`,
            }
        }

        return { backgroundColor: formData.bg_color || "#ffffff" }
    }

    const openingHours = selectedRestaurant?.opening_hours ? (selectedRestaurant?.opening_hours as OpeningHoursData) : null

    // Apply template
    const applyTemplate = async (template: Template) => {
        const templateData = template.preview
        setFormData(templateData)
    }

    if (!selectedRestaurant) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="flex items-center space-x-2 text-slate-500">
                    <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full" />
                    <span>Loading appearance...</span>
                </div>
            </div>
        )
    }



    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                    Appearance
                </h1>
                <p className="text-slate-500 mt-1">Customize how your restaurant page looks</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Tabs defaultValue="style" className="space-y-6">
                        <TabsList className="grid grid-cols-4 gap-4">
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
                            <TabsTrigger value="templates" className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                <span>Templates</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="style" className="space-y-4">
                            <Card className="border-slate-200 gap-0 pt-0">
                                <CardHeader className="py-4 gap-1">
                                    <CardTitle className="text-slate-900">Button Style</CardTitle>
                                    <CardDescription className="text-slate-500">Choose how your buttons should look</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-4">
                                        <Label className="text-slate-700">Shape</Label>
                                        <RadioGroup
                                            value={formData.button_style}
                                            onValueChange={(value: string) =>
                                                updateFormData({ button_style: value as "rounded" | "square" | "pill" })
                                            }
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
                                            value={formData.button_variant}
                                            onValueChange={(value: string) =>
                                                updateFormData({ button_variant: value as "solid" | "outline" })
                                            }
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <div>
                                                <RadioGroupItem value="solid" id="solid" className="peer sr-only" />
                                                <Label
                                                    htmlFor="solid"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                >
                                                    <div className="w-full h-10 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 mb-2 flex items-center justify-center">
                                                        <span className="text-white text-xs font-medium">Solid</span>
                                                    </div>
                                                    <span className="text-slate-700">Solid</span>
                                                </Label>
                                            </div>

                                            <div>
                                                <RadioGroupItem value="outline" id="outline" className="peer sr-only" />
                                                <Label
                                                    htmlFor="outline"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                >
                                                    <div className="w-full h-10 rounded-xl bg-white border-2 border-teal-600 mb-2 flex items-center justify-center">
                                                        <span className="text-teal-600 text-xs font-medium">Outline</span>
                                                    </div>
                                                    <span className="text-slate-700">Outline</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    {/* button icons show  */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border rounded-lg px-4 py-3">
                                            <div className="space-y-1">
                                                <Label className="text-slate-700 text-sm font-medium">Show Icons on Buttons</Label>
                                                <p className="text-sm text-muted-foreground">Enable this to show icons inside your link buttons.</p>
                                            </div>
                                            <Switch
                                                checked={formData.button_icons_show}
                                                onCheckedChange={(checked) =>
                                                    setFormData((prev) => ({ ...prev, button_icons_show: checked }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    {/* Gap between buttons (vertical spacing) */}
                                    <div className="space-y-2">
                                        <div>
                                            <Label className="text-slate-700 text-sm font-medium">
                                                Vertical Gap Between Buttons (px)
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Adjust the spacing between stacked buttons.
                                            </p>
                                        </div>
                                        <Select
                                            value={String(formData.buttons_gap_in_px)}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({ ...prev, buttons_gap_in_px: parseInt(value) }))
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select gap in px" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(16)].map((_, i) => {
                                                    const gap = i * 2;
                                                    if (gap === 0) return null
                                                    return (
                                                        <SelectItem key={gap} value={String(gap)}>
                                                            {gap}px
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 gap-0 pt-0">
                                <CardHeader className="py-4 gap-1">
                                    <CardTitle className="text-slate-900">Social Icon Style</CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Customize how your social icons appear.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Toggle for background */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border rounded-lg px-4 py-3">
                                            <div className="space-y-1">
                                                <Label className="text-slate-700 text-sm font-medium">Show Icon Background</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable this to show a colored circular behind each social icon.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.social_icon_bg_show}
                                                onCheckedChange={(checked) =>
                                                    setFormData((prev) => ({ ...prev, social_icon_bg_show: checked }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Select background color */}
                                    <div className="space-y-2">
                                        <div>
                                            <Label className="text-slate-700 text-sm font-medium">Icon Background Color</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Choose the background color for the icon container.
                                            </p>
                                        </div>
                                        <ColorSelector
                                            value={formData.social_icon_bg_color}
                                            onChange={(val) => setFormData((prev) => ({ ...prev, social_icon_bg_color: val }))}
                                        />
                                    </div>

                                    {/* Select icon color */}
                                    <div className="space-y-2">
                                        <div>
                                            <Label className="text-slate-700 text-sm font-medium">Icon Color</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Choose the color of the social icon itself.
                                            </p>
                                        </div>
                                        <ColorSelector
                                            value={formData.social_icon_color}
                                            onChange={(val) => setFormData((prev) => ({ ...prev, social_icon_color: val }))}
                                        />
                                    </div>
                                    {/* Horizonal Gap Between icons  */}
                                    <div className="space-y-2">
                                        <div>
                                            <Label className="text-slate-700 text-sm font-medium">
                                                Horizonal Gap Between Icons (px)
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Adjust the spacing between social icons.
                                            </p>
                                        </div>
                                        <Select
                                            value={String(formData.social_icon_gap)}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({ ...prev, social_icon_gap: parseInt(value) }))
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select gap in px" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(12)].map((_, i) => {
                                                    const gap = i * 2;
                                                    if (gap === 0) return null
                                                    return (
                                                        <SelectItem key={gap} value={String(gap)}>
                                                            {gap}px
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="templates">
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-slate-900">Design Templates</CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Choose from professionally designed templates to quickly style your restaurant page
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {templates.map((template) => (
                                            <motion.div
                                                key={template.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300"
                                            >
                                                {/* Template Preview */}
                                                <div className="aspect-[4/3] relative overflow-hidden">
                                                    <div
                                                        className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center"
                                                        style={{
                                                            background: template.preview.bg_type === "gradient"
                                                                ? `linear-gradient(to bottom right, ${template.preview.bg_gradient_start}, ${template.preview.bg_gradient_end})`
                                                                : template.preview.bg_color,
                                                            fontFamily: template.preview.font_family
                                                        }}
                                                    >
                                                        {/* Mock Restaurant Name */}
                                                        <h3
                                                            className="text-lg font-bold mb-2"
                                                            style={{ color: template.preview.headings_text_color }}
                                                        >
                                                            {selectedRestaurant?.name}
                                                        </h3>

                                                        {/* Mock Bio */}
                                                        <p
                                                            className="text-sm mb-4 opacity-90"
                                                            style={{ color: template.preview.headings_text_color }}
                                                        >
                                                            Delicious food & great atmosphere
                                                        </p>

                                                        {/* Mock Button */}
                                                        <div
                                                            className={`px-4 py-2 text-sm font-medium transition-all ${template.preview.button_style === "pill"
                                                                ? "rounded-full"
                                                                : template.preview.button_style === "square"
                                                                    ? "rounded-md"
                                                                    : "rounded-xl"
                                                                }`}
                                                            style={{
                                                                backgroundColor: template.preview.button_variant === "solid"
                                                                    ? template.preview.accent_color
                                                                    : "transparent",
                                                                color: template.preview.button_variant === "solid"
                                                                    ? template.preview.button_text_icons_color
                                                                    : template.preview.accent_color,
                                                                border: template.preview.button_variant === "outline"
                                                                    ? `2px solid ${template.preview.accent_color}`
                                                                    : "none"
                                                            }}
                                                        >
                                                            View Menu
                                                        </div>
                                                    </div>

                                                    {/* Overlay on hover */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                                                </div>

                                                {/* Template Info */}
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{template.name}</h4>
                                                            <span className="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full mt-1">
                                                                {template.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-4">{template.description}</p>

                                                    <Button
                                                        onClick={() => applyTemplate(template)}
                                                        disabled={saving}
                                                        className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                                                        size="sm"
                                                    >
                                                        {saving ? "Applying..." : "Apply Template"}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="colors">
                            <div className="space-y-4">
                                <Card className="border-slate-200 gap-0 pt-0">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-slate-900">Background</CardTitle>
                                        <CardDescription className="text-slate-500">
                                            Choose between a solid color, gradient, or custom image background
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <RadioGroup
                                            value={formData.bg_type}
                                            onValueChange={(value: string) =>
                                                updateFormData({ bg_type: value as "color" | "gradient" | "image" })
                                            }
                                            className="flex gap-3"
                                        >
                                            <div>
                                                <RadioGroupItem value="color" id="color" className="peer sr-only" />
                                                <Label
                                                    htmlFor="color"
                                                    className="flex flex-col w-[120px] items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                >
                                                    <div className="w-full h-8 rounded bg-teal-600 mb-2"></div>
                                                    <span className="text-slate-700">Solid Color</span>
                                                </Label>
                                            </div>

                                            <div>
                                                <RadioGroupItem value="gradient" id="gradient" className="peer sr-only" />
                                                <Label
                                                    htmlFor="gradient"
                                                    className="flex flex-col w-[120px] items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                >
                                                    <div className="w-full h-8 rounded bg-gradient-to-r from-teal-500 to-blue-500 mb-2"></div>
                                                    <span className="text-slate-700">Gradient</span>
                                                </Label>
                                            </div>

                                            <div>
                                                <RadioGroupItem value="image" id="image" className="peer sr-only" />
                                                <Label
                                                    htmlFor="image"
                                                    className="flex flex-col w-[120px] items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                                                >
                                                    <div className="w-full h-8 rounded bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center mb-2">
                                                        <ImageIcon className="h-6 w-6 text-slate-400" />
                                                    </div>
                                                    <span className="text-slate-700">Image</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>

                                        {formData.bg_type === "color" && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700">Background Color</Label>
                                                    <ColorSelector
                                                        value={formData.bg_color}
                                                        colors={["#FFFFFF", "#000000", ...colorPresets.map((item => item.color))]}
                                                        onChange={(val) => updateFormData({ bg_color: val })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {formData.bg_type === "gradient" && (
                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    <Label className="text-slate-700">Gradient Presets</Label>

                                                    <div className="grid grid-cols-10 gap-2">
                                                        {gradientPresets.map((preset) => (
                                                            <button
                                                                key={preset.name}
                                                                onClick={() =>
                                                                    updateFormData({
                                                                        bg_gradient_start: preset.start,
                                                                        bg_gradient_end: preset.end,
                                                                    })
                                                                }
                                                                className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 ring-offset-2 ring-teal-600 transition-all"
                                                                style={{
                                                                    background: `linear-gradient(to bottom right, ${preset.start}, ${preset.end})`,
                                                                }}
                                                                title={preset.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-slate-700">Gradient Direction</Label>
                                                    <Select
                                                        value={formData.gradient_direction}
                                                        onValueChange={(value) => updateFormData({ gradient_direction: value as GradientDirection })}
                                                    >
                                                        <SelectTrigger className="border-slate-200 !py-5 w-full">
                                                            <SelectValue placeholder="Select direction" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {gradientDirections.map((direction) => (
                                                                <SelectItem key={direction.value} value={direction.value} >
                                                                    <div className="flex flex-col items-start">
                                                                        <span>{direction.label}</span>
                                                                        <span className="text-xs text-slate-500">{direction.preview}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">Start Color</Label>
                                                        <ColorSelector
                                                            value={formData.bg_gradient_start}
                                                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item => item.color))]}
                                                            onChange={(val) => updateFormData({ bg_gradient_start: val })}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">End Color</Label>
                                                        <ColorSelector
                                                            value={formData.bg_gradient_end}
                                                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item => item.color))]}
                                                            onChange={(val) => updateFormData({ bg_gradient_end: val })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {formData.bg_type === "image" && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700">Image URL</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="url"
                                                            value={formData.bg_image_url || ""}
                                                            onChange={(e) => updateFormData({ bg_image_url: e.target.value })}
                                                            placeholder="https://example.com/background.jpg"
                                                            className="flex-1 border-slate-200"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Enter the URL of your background image. For best results, use an image at least 1920x1080px.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 gap-0 pt-0">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-slate-900">Accent Color</CardTitle>
                                        <CardDescription className="text-slate-500">
                                            This color will be used for buttons and highlights
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            <Label className="text-slate-700">Color Presets</Label>
                                            <div >
                                                <ColorSelector
                                                    value={formData.accent_color}
                                                    colors={colorPresets.map((item => item.color))}
                                                    onChange={(val) => updateFormData({ accent_color: val })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 gap-0 !pt-0">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-slate-900">Text Colors</CardTitle>
                                        <CardDescription className="text-slate-500">
                                            Customize the colors for headings and button text
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-slate-700">Headings Text Color</Label>
                                                <p className="text-xs mt-2 text-slate-500">Color for restaurant name and bio text</p>
                                            </div>
                                            <div >
                                                <ColorSelector
                                                    value={formData.headings_text_color}
                                                    colors={textColorPresets.map((item => item.color))}
                                                    onChange={(val) => updateFormData({ headings_text_color: val })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-slate-700">Button Text & Icons Color</Label>
                                                <p className="text-xs mt-2 text-slate-500">Color for text and icons inside buttons</p>
                                            </div>
                                            <div >
                                                <ColorSelector
                                                    value={formData.button_text_icons_color}
                                                    colors={textColorPresets.map((item => item.color))}
                                                    onChange={(val) => updateFormData({ button_text_icons_color: val })}
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
                                        <Select
                                            value={formData.font_family}
                                            onValueChange={(value) => updateFormData({ font_family: value })}
                                        >
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
                                            <div className="p-4 rounded-lg bg-slate-100" style={{ fontFamily: formData.font_family }}>
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

                    {/* Floating Action Buttons */}
                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="fixed bottom-6 right-6 flex gap-2 z-50"
                        >
                            <Button
                                onClick={resetForm}
                                variant="outline"
                                size="sm"
                                className="bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </Button>
                            <Button
                                onClick={saveChanges}
                                disabled={saving}
                                size="sm"
                                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Live Preview */}
                <div className="lg:sticky lg:top-24 space-y-6">
                    <Card className="overflow-hidden border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900">Live Preview</CardTitle>
                            <CardDescription className="text-slate-500">See how your page looks on mobile devices</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="mx-auto max-w-[350px] lg:max-w-[400px] p-6">
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
                                            <div className="min-h-[600px] lg:min-h-[650px] no-scroll overflow-y-auto max-h-[610px]" style={getBackgroundStyle()}>
                                                <div className="p-4 flex flex-col items-center">
                                                    {selectedRestaurant?.logo_url ? (
                                                        <motion.img
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                            src={selectedRestaurant.logo_url}
                                                            alt={selectedRestaurant.name}
                                                            className="mb-5 h-24 w-24 rounded-full object-cover"
                                                            loading="eager" />
                                                    ) : (
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                            className="mb-5 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ring-white/20 fallback-initial"
                                                            style={{ backgroundColor: formData.accent_color }}
                                                        >
                                                            <span className="text-xl font-bold text-white">{selectedRestaurant?.name.charAt(0)}</span>
                                                        </motion.div>
                                                    )}

                                                    <motion.h2
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="mb-3 text-2xl font-bold"
                                                        style={{
                                                            color: formData.headings_text_color,
                                                            fontFamily: formData.font_family,
                                                        }}
                                                    >
                                                        {selectedRestaurant?.name}
                                                    </motion.h2>

                                                    {/* Opening Hours Status */}
                                                    {openingHours && (
                                                        <motion.div
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.25 }}
                                                            className="mb-4"
                                                        >
                                                            <OpeningHoursStatus
                                                                openingHours={openingHours}
                                                                color={formData.headings_text_color || "#000000"}
                                                                className="text-white cursor-pointer text-center"
                                                                accentColor={formData.accent_color || "#10b981"}
                                                            />
                                                        </motion.div>
                                                    )}

                                                    {
                                                        selectedRestaurant?.google_place_id &&
                                                            reviewLoading
                                                            ?
                                                            <Skeleton className="w-[80px] h-[36px] animate-pulse" />
                                                            :
                                                            reviewData.rating
                                                                ?
                                                                <motion.div
                                                                    initial={{ y: 20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.25 }}
                                                                    className="mb-4"
                                                                >
                                                                    <GoogleRating info={{
                                                                        rating: reviewData.rating,
                                                                        user_ratings_total: reviewData.user_ratings_total
                                                                    }}
                                                                        color={formData?.headings_text_color || "#000000"}
                                                                    />
                                                                </motion.div>
                                                                :
                                                                ""
                                                    }

                                                    {selectedRestaurant?.bio && (
                                                        <motion.p
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.3 }}
                                                            className="mx-auto mb-4 text-center max-w-md text-sm"
                                                            style={{
                                                                color: formData.headings_text_color,
                                                                opacity: 0.9,
                                                                fontFamily: formData.font_family,
                                                            }}
                                                        >
                                                            {selectedRestaurant.bio}
                                                        </motion.p>
                                                    )}

                                                    {(selectedRestaurant?.instagram ||
                                                        selectedRestaurant?.facebook ||
                                                        selectedRestaurant?.email ||
                                                        selectedRestaurant?.address ||
                                                        selectedRestaurant?.whatsapp)
                                                        &&
                                                        <SocialIcons
                                                            restaurant={
                                                                {
                                                                    address: selectedRestaurant?.address,
                                                                    email: selectedRestaurant.email,
                                                                    facebook: selectedRestaurant.facebook,
                                                                    instagram: selectedRestaurant.facebook,
                                                                    whatsapp: selectedRestaurant.whatsapp,
                                                                }
                                                            }
                                                            className="mb-4"
                                                            theme={{
                                                                socialIconColor: formData.social_icon_color,
                                                                socialIconBgShow: formData.social_icon_bg_show,
                                                                socialIconBgColor: formData.social_icon_bg_color,
                                                                social_icon_gap: formData.social_icon_gap
                                                            }}
                                                        />
                                                    }
                                                </div>

                                                <motion.div variants={container} initial="hidden" animate="show"
                                                    className="flex-grow px-4 mb-4 flex flex-col"
                                                    style={{ rowGap: `${formData.buttons_gap_in_px}px` }}
                                                >
                                                    {
                                                        linksLoading ?
                                                            <p className="w-full text-center text-sm">
                                                                Loading..
                                                            </p>
                                                            :
                                                            <>
                                                                {
                                                                    links?.length > 0
                                                                        ?
                                                                        <>
                                                                            {links?.map((link) => (
                                                                                <div
                                                                                    key={link.id}
                                                                                    rel="noopener noreferrer"
                                                                                    className={`group flex items-center justify-center  text-center w-full h-[52px]  transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${selectedRestaurant?.button_icons_show ? "px-14" : "px-4"} ${formData.button_style === "pill"
                                                                                        ? "rounded-full"
                                                                                        : formData.button_style === "square"
                                                                                            ? "rounded-md"
                                                                                            : "rounded-xl"
                                                                                        }`}
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            formData.button_variant === "solid"
                                                                                                ? formData.accent_color || "#10b981"
                                                                                                : "transparent",
                                                                                        backdropFilter: "blur(8px)",
                                                                                        border: `2px solid ${formData.accent_color || "#10b981"}`,
                                                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                                        color: formData.button_variant === "solid" ? formData.button_text_icons_color || "#000000" : formData.accent_color || "#10b981",
                                                                                        fontFamily: formData.font_family || "Inter",
                                                                                        letterSpacing: "0.01em",
                                                                                    }}
                                                                                >

                                                                                    {
                                                                                        formData.button_icons_show
                                                                                        &&
                                                                                        <div className="flex aspect-square absolute left-[7px]  shrink-0 size-[38px] items-center justify-center rounded-full "
                                                                                            style={{
                                                                                                backgroundColor: formData.button_text_icons_color || "transparent"
                                                                                            }}
                                                                                        >
                                                                                            {getLucideIconBySlug(link.icon_slug, { className: "w-4 h-4", style: { color: formData.accent_color || "transparent" } })}
                                                                                        </div>
                                                                                    }
                                                                                    <span
                                                                                        className={`relative w-full text-[15px] ${formData.button_variant === "outline" ? "group-hover:text-white" : ""
                                                                                            } transition-colors duration-300 font-medium`}
                                                                                        style={{
                                                                                            color:
                                                                                                formData.button_variant === "outline" ? formData.accent_color || "#10b981" : formData.button_text_icons_color,
                                                                                        }}
                                                                                    >
                                                                                        {link.title}
                                                                                    </span>
                                                                                    {
                                                                                        formData.button_icons_show
                                                                                        &&
                                                                                        <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                                                                            <MoreVertical className="size-4" />
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            ))}
                                                                        </>
                                                                        :
                                                                        <p className="w-full text-center text-sm">
                                                                            No links yet add some to see preview.
                                                                        </p>
                                                                }

                                                            </>
                                                    }
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
    )
}
