"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Globe2, RotateCcw, Save } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRestaurantStore } from "@/stores/restaurant-store"

interface IntegrationFormData {
    google_place_id: string
}

export default function IntegrationsPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()

    const [formData, setFormData] = useState<IntegrationFormData>({
        google_place_id: "",
    })

    const [initialData, setInitialData] = useState<IntegrationFormData>(formData)
    const [saving, setSaving] = useState(false)

    // Load data from restaurant store
    useEffect(() => {
        if (selectedRestaurant) {
            const data: IntegrationFormData = {
                google_place_id: selectedRestaurant.google_place_id || "",
            }

            setFormData(data)
            setInitialData(data)
        }
    }, [selectedRestaurant])

    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

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

            const response = await fetch(`/api/restaurants/${selectedRestaurant.id}/integrations`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update integration settings")
            }

            const result = await response.json()

            // Update store with response data
            updateSelectedRestaurant(result.data)

            // Update initial data to reflect saved state
            setInitialData(formData)

            toast.success("Integration settings updated", {
                description: "Your integration settings have been updated successfully",
            })
        } catch (error: any) {
            console.error("Error updating integration settings:", error)
            toast.error("Error updating integration settings", {
                description: error.message || "An error occurred while updating your integration settings",
            })
        } finally {
            setSaving(false)
        }
    }

    if (!selectedRestaurant) {
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
                    <span>Loading integrations information...</span>
                </div>
            </div>
        )
    }

    return (
        <>
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
                                value={formData.google_place_id}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, google_place_id: e.target.value }))
                                }}
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

                    {formData.google_place_id && (
                        <div className="rounded-lg bg-emerald-50 p-4">
                            <div className="flex items-start gap-3">
                                <Globe2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-emerald-900">Integration Active</h4>
                                    <p className="text-sm text-emerald-700 mt-1">
                                        Your restaurant is connected to Google Places. Reviews and ratings will be displayed on your page.
                                    </p>
                                    <p className="text-xs text-emerald-600 mt-2 font-mono">Place ID: {formData.google_place_id}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Floating Action Buttons */}
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
                <div className="flex gap-2">
                    <Button
                        onClick={resetForm}
                        disabled={saving || !hasChanges}
                        variant="outline"
                        size="lg"
                        className="shadow-lg bg-transparent"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                    <Button
                        onClick={saveSettings}
                        disabled={saving || !hasChanges}
                        size="lg"
                        className="bg-emerald-600 shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </motion.div>
        </>
    )
}
