"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Battery,
    Calendar,
    ExternalLink,
    Facebook,
    ImageIcon,
    Instagram,
    MapPin,
    MenuIcon,
    Paintbrush,
    Palette,
    RotateCcw,
    Signal,
    Type,
    Wifi,
} from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRestaurantStore } from "@/stores/restaurant-store"

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
    bg_gradient_end: string
    gradient_direction: string
    button_variant: "solid" | "outline"
    bg_image_url?: string
}

// Dummy links for preview
const dummyLinks = [
    { id: "1", title: "View Menu", url: "#", sort_order: 1 },
    { id: "2", title: "Make Reservation", url: "#", sort_order: 2 },
    { id: "3", title: "Follow on Instagram", url: "#", sort_order: 3 },
    { id: "4", title: "Get Directions", url: "#", sort_order: 4 },
    { id: "5", title: "Order Online", url: "#", sort_order: 5 },
]

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

export default function AppearancePage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()

    // Form state
    const [formData, setFormData] = useState<AppearanceFormData>({
        bg_color: "#ffffff",
        accent_color: "#10b981",
        headings_text_color: "#ffffff",
        button_text_icons_color: "#000000",
        button_style: "rounded",
        font_family: "Inter",
        bg_type: "color",
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

    const getIconForLink = (title: string) => {
        const lowerTitle = title.toLowerCase()

        if (lowerTitle.includes("instagram") || lowerTitle.includes("follow")) return <Instagram className="h-4 w-4" />
        if (lowerTitle.includes("reservation") || lowerTitle.includes("book")) return <Calendar className="h-4 w-4" />
        if (lowerTitle.includes("direction") || lowerTitle.includes("location")) return <MapPin className="h-4 w-4" />
        if (lowerTitle.includes("menu")) return <MenuIcon className="h-4 w-4" />

        return <ExternalLink className="h-4 w-4" />
    }

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

    // Get button styles based on variant
    const getButtonStyle = () => {
        if (formData.button_variant === "solid") {
            return {
                backgroundColor: formData.accent_color,
                color: formData.button_text_icons_color,
                border: `2px solid ${formData.accent_color}`,
            }
        } else {
            // Outline variant
            return {
                backgroundColor: "transparent",
                color: formData.button_text_icons_color,
                border: `2px solid ${formData.accent_color}`,
            }
        }
    }

    if (!selectedRestaurant) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-16 flex justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Restaurant Selected</h2>
                    <p className="text-gray-600">Please select a restaurant to customize its appearance.</p>
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
                        <TabsList className="grid grid-cols-3 gap-4">
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
                                            value={formData.bg_type}
                                            onValueChange={(value: string) =>
                                                updateFormData({ bg_type: value as "color" | "gradient" | "image" })
                                            }
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

                                        {formData.bg_type === "color" && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700">Background Color</Label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded border" style={{ backgroundColor: formData.bg_color }} />
                                                        <Input
                                                            type="color"
                                                            value={formData.bg_color}
                                                            onChange={(e) => updateFormData({ bg_color: e.target.value })}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {formData.bg_type === "gradient" && (
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <Label className="text-slate-700">Gradient Presets</Label>
                                                    <div className="grid grid-cols-5 gap-2">
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

                                                <div className="space-y-4">
                                                    <Label className="text-slate-700">Gradient Direction</Label>
                                                    <Select
                                                        value={formData.gradient_direction}
                                                        onValueChange={(value) => updateFormData({ gradient_direction: value })}
                                                    >
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
                                                                style={{ backgroundColor: formData.bg_gradient_start }}
                                                            />
                                                            <Input
                                                                type="color"
                                                                value={formData.bg_gradient_start}
                                                                onChange={(e) => updateFormData({ bg_gradient_start: e.target.value })}
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">End Color</Label>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-10 h-10 rounded border"
                                                                style={{ backgroundColor: formData.bg_gradient_end }}
                                                            />
                                                            <Input
                                                                type="color"
                                                                value={formData.bg_gradient_end}
                                                                onChange={(e) => updateFormData({ bg_gradient_end: e.target.value })}
                                                                className="flex-1"
                                                            />
                                                        </div>
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
                                            <div className="grid grid-cols-4 gap-2">
                                                {colorPresets.map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => updateFormData({ accent_color: preset.color })}
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
                                                <div className="w-10 h-10 rounded border" style={{ backgroundColor: formData.accent_color }} />
                                                <Input
                                                    type="color"
                                                    value={formData.accent_color}
                                                    onChange={(e) => updateFormData({ accent_color: e.target.value })}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900">Text Colors</CardTitle>
                                        <CardDescription className="text-slate-500">
                                            Customize the colors for headings and button text
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-slate-700">Headings Text Color</Label>
                                            <p className="text-xs text-slate-500">Color for restaurant name and bio text</p>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {textColorPresets.map((preset) => (
                                                        <button
                                                            key={preset.name}
                                                            onClick={() => updateFormData({ headings_text_color: preset.color })}
                                                            className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 ring-offset-2 ring-teal-600 transition-all border"
                                                            style={{ backgroundColor: preset.color }}
                                                            title={preset.name}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-10 h-10 rounded border"
                                                        style={{ backgroundColor: formData.headings_text_color }}
                                                    />
                                                    <Input
                                                        type="color"
                                                        value={formData.headings_text_color}
                                                        onChange={(e) => updateFormData({ headings_text_color: e.target.value })}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-slate-700">Button Text & Icons Color</Label>
                                            <p className="text-xs text-slate-500">Color for text and icons inside buttons</p>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {textColorPresets.map((preset) => (
                                                        <button
                                                            key={preset.name}
                                                            onClick={() => updateFormData({ button_text_icons_color: preset.color })}
                                                            className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 ring-offset-2 ring-teal-600 transition-all border"
                                                            style={{ backgroundColor: preset.color }}
                                                            title={preset.name}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-10 h-10 rounded border"
                                                        style={{ backgroundColor: formData.button_text_icons_color }}
                                                    />
                                                    <Input
                                                        type="color"
                                                        value={formData.button_text_icons_color}
                                                        onChange={(e) => updateFormData({ button_text_icons_color: e.target.value })}
                                                        className="flex-1"
                                                    />
                                                </div>
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
                                            <div className="min-h-[520px]" style={getBackgroundStyle()}>
                                                <div className="p-4 flex flex-col items-center">
                                                    {selectedRestaurant?.logo_url ? (
                                                        <motion.img
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                            src={selectedRestaurant.logo_url}
                                                            alt={selectedRestaurant.name}
                                                            className="w-16 h-16 rounded-full object-cover mb-3 shadow-lg ring-4 ring-black/10"
                                                        />
                                                    ) : (
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                            className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ring-4 ring-black/10"
                                                            style={{ backgroundColor: formData.accent_color }}
                                                        >
                                                            <span className="text-xl font-bold text-white">{selectedRestaurant?.name.charAt(0)}</span>
                                                        </motion.div>
                                                    )}

                                                    <motion.h2
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="text-lg font-bold mb-1"
                                                        style={{
                                                            color: formData.headings_text_color,
                                                            fontFamily: formData.font_family,
                                                        }}
                                                    >
                                                        {selectedRestaurant?.name}
                                                    </motion.h2>

                                                    {selectedRestaurant?.bio && (
                                                        <motion.p
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.3 }}
                                                            className="text-xs text-center mb-6"
                                                            style={{
                                                                color: formData.headings_text_color,
                                                                opacity: 0.9,
                                                                fontFamily: formData.font_family,
                                                            }}
                                                        >
                                                            {selectedRestaurant.bio}
                                                        </motion.p>
                                                    )}

                                                    {(selectedRestaurant?.instagram || selectedRestaurant?.facebook) && (
                                                        <motion.div
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.4 }}
                                                            className="flex items-center justify-center gap-4 mb-4"
                                                        >
                                                            {selectedRestaurant.instagram && (
                                                                <a
                                                                    href={selectedRestaurant.instagram}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
                                                                    style={{ color: formData.accent_color }}
                                                                >
                                                                    <Instagram className="h-5 w-5" />
                                                                </a>
                                                            )}
                                                            {selectedRestaurant.facebook && (
                                                                <a
                                                                    href={selectedRestaurant.facebook}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
                                                                    style={{ color: formData.accent_color }}
                                                                >
                                                                    <Facebook className="h-5 w-5" />
                                                                </a>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </div>

                                                <motion.div variants={container} initial="hidden" animate="show" className="px-3 space-y-2">
                                                    {dummyLinks.map((link) => (
                                                        <motion.div
                                                            key={link.id}
                                                            variants={item}
                                                            className={`flex items-center gap-2 px-3 py-2.5 w-full transition-all hover:scale-[1.02] active:scale-[0.98] ${formData.button_style === "pill"
                                                                ? "rounded-full"
                                                                : formData.button_style === "square"
                                                                    ? "rounded-md"
                                                                    : "rounded-xl"
                                                                }`}
                                                            style={{
                                                                ...getButtonStyle(),
                                                                backdropFilter: formData.button_variant === "outline" ? "blur(8px)" : "none",
                                                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                                                                fontFamily: formData.font_family,
                                                            }}
                                                        >
                                                            <span style={{ color: formData.button_text_icons_color }}>
                                                                {getIconForLink(link.title)}
                                                            </span>
                                                            <span className="font-medium text-xs" style={{ color: formData.button_text_icons_color }}>
                                                                {link.title}
                                                            </span>
                                                        </motion.div>
                                                    ))}
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
