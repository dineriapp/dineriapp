"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Save } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Mock restaurant data
const mockRestaurant = {
    id: "1",
    name: "Bella Vista Restaurant",
    slug: "bella-vista-restaurant",
    bio: "Authentic Italian cuisine in the heart of the city with fresh ingredients and traditional recipes.",
    logo_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&crop=center",
}

export default function BusinessInformationPage() {
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [bio, setBio] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        const loadData = () => {
            setLoading(true)
            setTimeout(() => {
                const data = mockRestaurant
                setName(data.name)
                setSlug(data.slug)
                setBio(data.bio || "")
                setLogoUrl(data.logo_url || "")
                setLoading(false)
            }, 400)
        }
        loadData()
    }, [])

    const handleInputChange = (setter: any, value: string) => {
        setter(value)
        setHasChanges(true)
    }

    const saveProfile = async () => {
        try {
            setSaving(true)

            // Simulate slug uniqueness check
            if (slug !== mockRestaurant.slug) {
                const existingSlugs = ["taken-slug", "another-restaurant", "busy-cafe"]
                if (existingSlugs.includes(slug)) {
                    toast.error("Slug already exists", {
                        description: "Please choose a different URL for your restaurant page",
                    })
                    setSaving(false)
                    return
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success("Business information updated", {
                description: "Your restaurant information has been updated successfully",
            })
            setHasChanges(false)
        } catch (error: any) {
            toast.error("Error updating information", {
                description: error.message || "An error occurred while updating your information",
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
                    <span>Loading business information...</span>
                </div>
            </div>
        )
    }

    return (
        <>
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
