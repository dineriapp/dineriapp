"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Check, Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Template {
    id: string
    name: string
    description: string
    preview: string
    style: {
        bgType: "color" | "gradient"
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
            accentColor: "#0ea5e9",
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
            bgGradientStart: "#0d9488",
            bgGradientEnd: "#0284c7",
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
            accentColor: "#0ea5e9",
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
            bgGradientStart: "#0d9488",
            bgGradientEnd: "#0284c7",
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
            accentColor: "#0ea5e9",
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
            bgGradientStart: "#0d9488",
            bgGradientEnd: "#0284c7",
            gradientDirection: "top-right",
            accentColor: "#ffffff",
            buttonStyle: "rounded",
            buttonVariant: "solid",
            fontFamily: "SF Pro Display",
        },
        premium: true,
    },
]

export function TemplatesSection() {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("modern")
    const [applying, setApplying] = useState(false)

    const handleApplyTemplate = async (template: Template) => {
        if (template.premium) {
            toast("This template is only available with a premium subscription")
            return
        }

        try {
            setApplying(true)

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            setSelectedTemplate(template.id)
            toast(`Your page now uses the ${template.name} template`)

            // In a real app, we would update the parent component with the new template settings
        } catch {
            toast("Error applying template: " + ("An unknown error occurred"))
        } finally {
            setApplying(false)
        }
    }

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">Templates</CardTitle>
                <CardDescription className="text-slate-500">Choose from our professionally designed templates</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {templates.map((template) => (
                        <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative"
                        >
                            <div className="aspect-[3/4] rounded-lg overflow-hidden">
                                <img
                                    src={template.preview || "/placeholder.svg"}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                                        {template.premium && (
                                            <Badge variant="secondary" className="bg-amber-400/90 text-amber-950">
                                                <Crown className="h-3 w-3 mr-1" />
                                                Premium
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/90 mb-4">{template.description}</p>
                                    <Button
                                        onClick={() => handleApplyTemplate(template)}
                                        className={`w-full flex items-center justify-center gap-1 text-xs ${selectedTemplate === template.id
                                            ? "bg-teal-600 text-white hover:bg-teal-700"
                                            : "bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white"
                                            }`}
                                        disabled={selectedTemplate === template.id || applying}
                                    >
                                        {selectedTemplate === template.id ? (
                                            <>
                                                <Check className="h-4 w-4 " />
                                                Applied
                                            </>
                                        ) : template.premium ? (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Upgrade to Apply
                                            </>
                                        ) : applying ? (
                                            "Applying..."
                                        ) : (
                                            "Apply Template"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
