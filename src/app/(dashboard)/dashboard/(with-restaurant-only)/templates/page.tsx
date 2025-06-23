"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Check, Crown, Sparkles, Layout, ImageIcon, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { DashboardHeader } from "../../../_components/header"

interface Restaurant {
    id: string
    name: string
    subscription_plan: "basic" | "premium"
    bg_type?: "color" | "gradient" | "image"
    bg_color?: string
    bg_gradient_start?: string
    bg_gradient_end?: string
    gradient_direction?: string
    accent_color?: string
    button_style?: "rounded" | "square" | "pill"
    button_variant?: "solid" | "outline"
    font_family?: string
    bg_image_url?: string
}

interface Template {
    id: string
    name: string
    description: string
    preview: string
    style: {
        bgType: "color" | "gradient" | "image"
        bgColor?: string
        bgGradientStart?: string
        bgGradientEnd?: string
        gradientDirection?: string
        accentColor: string
        buttonStyle: "rounded" | "square" | "pill"
        buttonVariant: "solid" | "outline"
        fontFamily: string
    }
    premium?: boolean
}

const templates: Template[] = [
    {
        id: "classic",
        name: "Classic",
        description: "Timeless and elegant design with a focus on readability",
        preview:
            "https://images.pexels.com/photos/6267/menu-restaurant-vintage-table.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        style: {
            bgType: "color",
            bgColor: "#ffffff",
            accentColor: "#10b981",
            buttonStyle: "rounded",
            buttonVariant: "solid",
            fontFamily: "Inter",
        },
    },
    {
        id: "modern",
        name: "Modern",
        description: "Contemporary design with gradient accents",
        preview:
            "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        style: {
            bgType: "gradient",
            bgGradientStart: "#047857",
            bgGradientEnd: "#059669",
            gradientDirection: "bottom-right",
            accentColor: "#ffffff",
            buttonStyle: "pill",
            buttonVariant: "outline",
            fontFamily: "SF Pro Display",
        },
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Clean and minimalistic with subtle animations",
        preview:
            "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        style: {
            bgType: "color",
            bgColor: "#f8fafc",
            accentColor: "#334155",
            buttonStyle: "square",
            buttonVariant: "outline",
            fontFamily: "Helvetica Neue",
        },
    },
    {
        id: "fine-dining",
        name: "Fine Dining",
        description: "Sophisticated design for upscale restaurants",
        preview:
            "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        style: {
            bgType: "gradient",
            bgGradientStart: "#1e293b",
            bgGradientEnd: "#334155",
            gradientDirection: "bottom",
            accentColor: "#fbbf24",
            buttonStyle: "rounded",
            buttonVariant: "outline",
            fontFamily: "Playfair Display",
        },
        premium: true,
    },
    {
        id: "bistro",
        name: "Bistro & Café",
        description: "Warm and inviting design for casual dining",
        preview:
            "https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        style: {
            bgType: "color",
            bgColor: "#fffbeb",
            accentColor: "#b45309",
            buttonStyle: "pill",
            buttonVariant: "solid",
            fontFamily: "Inter",
        },
    },
    {
        id: "street-food",
        name: "Street Food",
        description: "Vibrant and energetic design for food trucks and casual spots",
        preview:
            "https://images.pexels.com/photos/2280573/pexels-photo-2280573.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        style: {
            bgType: "gradient",
            bgGradientStart: "#f97316",
            bgGradientEnd: "#fb923c",
            gradientDirection: "top-right",
            accentColor: "#ffffff",
            buttonStyle: "rounded",
            buttonVariant: "solid",
            fontFamily: "SF Pro Display",
        },
        premium: true,
    },
]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export default function TemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [applying, setApplying] = useState(false)
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [bgType, setBgType] = useState<"template" | "custom">("template")
    const [customBgUrl, setCustomBgUrl] = useState("")
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        loadRestaurant()
    }, [])

    const loadRestaurant = async () => {
        try {
            // Simulate loading delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Mock restaurant data with premium subscription
            const mockRestaurant: Restaurant = {
                id: "rest_123",
                name: "Bella Vista Restaurant",
                subscription_plan: "premium",
                bg_type: "color",
                bg_color: "#ffffff",
                accent_color: "#10b981",
                button_style: "rounded",
                button_variant: "solid",
                font_family: "Inter",
            }

            setRestaurant(mockRestaurant)

            if (mockRestaurant.bg_image_url) {
                setBgType("custom")
                setCustomBgUrl(mockRestaurant.bg_image_url)
            } else {
                const currentTemplate = templates.find(
                    (t) =>
                        t.style.bgType === mockRestaurant.bg_type &&
                        (t.style.bgType === "color" ? t.style.bgColor === mockRestaurant.bg_color : true) &&
                        (t.style.bgType === "gradient"
                            ? t.style.bgGradientStart === mockRestaurant.bg_gradient_start &&
                            t.style.bgGradientEnd === mockRestaurant.bg_gradient_end
                            : true) &&
                        t.style.buttonStyle === mockRestaurant.button_style &&
                        t.style.buttonVariant === mockRestaurant.button_variant &&
                        t.style.fontFamily === mockRestaurant.font_family,
                )

                if (currentTemplate) {
                    setSelectedTemplate(currentTemplate.id)
                }
            }
        } catch (error) {
            console.error("Error loading restaurant:", error)
            toast.error("Failed to load restaurant data")
        }
    }

    const handleApplyTemplate = async (template: Template) => {
        if (template.premium && (!restaurant?.subscription_plan || restaurant.subscription_plan === "basic")) {
            toast.error("Premium Template", {
                description: "This template is only available with a premium subscription",
            })
            router.push("/dashboard/upgrade")
            return
        }

        try {
            setApplying(true)

            if (!restaurant) {
                throw new Error("No restaurant found")
            }

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Update local restaurant state
            const updatedRestaurant = {
                ...restaurant,
                bg_type: template.style.bgType,
                bg_color: template.style.bgColor || null,
                bg_gradient_start: template.style.bgGradientStart || null,
                bg_gradient_end: template.style.bgGradientEnd || null,
                gradient_direction: template.style.gradientDirection || null,
                accent_color: template.style.accentColor,
                button_style: template.style.buttonStyle,
                button_variant: template.style.buttonVariant,
                font_family: template.style.fontFamily,
                bg_image_url: null,
            }

            setRestaurant(updatedRestaurant as any)
            setSelectedTemplate(template.id)
            setBgType("template")
            setCustomBgUrl("")

            toast.success("Template Applied", {
                description: `Your page now uses the ${template.name} template`,
            })
        } catch (error: any) {
            toast.error("Error applying template", {
                description: error.message || "Failed to apply template",
            })
        } finally {
            setApplying(false)
        }
    }

    const handleSaveCustomBackground = async () => {
        if (!restaurant) return

        try {
            setSaving(true)

            // Validate URL
            try {
                new URL(customBgUrl)
            } catch {
                throw new Error("Please enter a valid URL")
            }

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            // Update restaurant with new background image URL
            const updatedRestaurant = {
                ...restaurant,
                bg_type: "image" as const,
                bg_image_url: customBgUrl,
                bg_color: null,
                bg_gradient_start: null,
                bg_gradient_end: null,
            }

            setRestaurant(updatedRestaurant as any)
            setSelectedTemplate(null)

            toast.success("Background updated", {
                description: "Your custom background has been updated",
            })
        } catch (error: any) {
            toast.error("Error updating background", {
                description: error.message || "Failed to update background",
            })
        } finally {
            setSaving(false)
        }
    }

    const resetToDefaults = () => {
        if (!restaurant) return

        const defaultTemplate = templates[0] // Classic template
        const updatedRestaurant = {
            ...restaurant,
            bg_type: defaultTemplate.style.bgType,
            bg_color: defaultTemplate.style.bgColor,
            bg_gradient_start: null,
            bg_gradient_end: null,
            gradient_direction: null,
            accent_color: defaultTemplate.style.accentColor,
            button_style: defaultTemplate.style.buttonStyle,
            button_variant: defaultTemplate.style.buttonVariant,
            font_family: defaultTemplate.style.fontFamily,
            bg_image_url: null,
        }

        setRestaurant(updatedRestaurant as any)
        setSelectedTemplate(defaultTemplate.id)
        setBgType("template")
        setCustomBgUrl("")

        toast.success("Reset to defaults", {
            description: "Template settings have been reset to default values",
        })
    }

    const [loading, setLoading] = useState(true)
    console.log(restaurant)
    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setLoading(false)
        }, 600)

        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardHeader />
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
                        <span>Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto mb-12 max-w-3xl text-center"
                >
                    <h1 className="mb-4 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-4xl font-bold text-transparent">
                        Choose Your Template
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Select from our professionally designed templates or use a custom background
                    </p>
                </motion.div>

                <div className="mx-auto mb-12 max-w-3xl">
                    <RadioGroup
                        value={bgType}
                        onValueChange={(value) => setBgType(value as "template" | "custom")}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="template" id="template" className="peer sr-only" />
                            <Label
                                htmlFor="template"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500"
                            >
                                <div className="mb-2">
                                    <Layout className="h-6 w-6 text-emerald-600" />
                                </div>
                                <span className="font-medium">Use Template</span>
                                <span className="text-sm text-muted-foreground">Choose from our pre-designed templates</span>
                            </Label>
                        </div>

                        <div>
                            <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                            <Label
                                htmlFor="custom"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500"
                            >
                                <div className="mb-2">
                                    <ImageIcon className="h-6 w-6 text-emerald-600" />
                                </div>
                                <span className="font-medium">Custom Background</span>
                                <span className="text-sm text-muted-foreground">Use your own background image</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {bgType === "template" ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {templates.map((template) => (
                            <motion.div key={template.id} variants={item} className="group relative">
                                <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl">
                                    <div className="absolute inset-0 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100" />

                                    <img
                                        src={template.preview || "/placeholder.svg"}
                                        alt={template.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                                            {template.premium && (
                                                <Badge
                                                    variant="secondary"
                                                    className="border-none bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-lg"
                                                >
                                                    <Crown className="mr-1 h-3.5 w-3.5" />
                                                    Premium
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="mb-4 line-clamp-2 text-sm text-white/90">{template.description}</p>

                                        <Button
                                            onClick={() => handleApplyTemplate(template)}
                                            className={`w-full transition-all duration-300 ${selectedTemplate === template.id
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                : template.premium &&
                                                    (!restaurant?.subscription_plan || restaurant.subscription_plan === "basic")
                                                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600"
                                                    : "bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-white"
                                                }`}
                                            disabled={applying}
                                        >
                                            {selectedTemplate === template.id ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Currently Active
                                                </>
                                            ) : template.premium &&
                                                (!restaurant?.subscription_plan || restaurant.subscription_plan === "basic") ? (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Upgrade to Apply
                                                </>
                                            ) : applying ? (
                                                "Applying..."
                                            ) : (
                                                "Use This Template"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Custom Background</CardTitle>
                                <CardDescription>Enter the URL of your background image</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {customBgUrl && (
                                    <div className="relative mb-6 aspect-[3/2] overflow-hidden rounded-lg">
                                        <img
                                            src={customBgUrl || "/placeholder.svg"}
                                            alt="Current background"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Invalid+Image+URL"
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <Label>Image URL</Label>
                                    <div className="grid grid-cols-[1fr,auto] gap-4">
                                        <Input
                                            type="url"
                                            value={customBgUrl}
                                            onChange={(e) => setCustomBgUrl(e.target.value)}
                                            placeholder="https://example.com/your-image.jpg"
                                            className="bg-white focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                        <Button
                                            onClick={handleSaveCustomBackground}
                                            disabled={!customBgUrl || saving}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            {saving ? (
                                                "Saving..."
                                            ) : (
                                                <>
                                                    <LinkIcon className="mr-2 h-4 w-4" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Enter the URL of your background image. Recommended size: 1920x1080px.
                                    </p>
                                </div>

                                <div className="pt-4 border-t">
                                    <Button onClick={resetToDefaults} variant="outline" className="w-full">
                                        Reset to Default Template
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
