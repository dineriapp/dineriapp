"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { uploadImage } from "@/supabase/clients/client"
import { AlertCircle, Building2, Globe, RotateCcw, Save } from "lucide-react"
import { motion } from "motion/react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

// Validation schemas
const nameSchema = z
    .string()
    .min(1, "Restaurant name is required")
    .max(100, "Restaurant name must be less than 100 characters")

const slugSchema = z
    .string()
    .min(3, "Page URL must be at least 3 characters")
    .max(50, "Page URL must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Page URL can only contain lowercase letters, numbers, and hyphens")

const bioSchema = z.string().max(200, "Bio must be less than 200 characters")

const logoUrlSchema = z.string().url("Logo URL must be a valid URL")

interface FormErrors {
    name?: string
    slug?: string
    bio?: string
    logo_url?: string
}

interface BusinessFormData {
    name: string
    slug: string
    bio: string
    logo_url: string
}

export default function BusinessInformationPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Form state
    const [formData, setFormData] = useState<BusinessFormData>({
        name: "",
        slug: "",
        bio: "",
        logo_url: "",
    })

    // Initial data for reset functionality
    const [initialData, setInitialData] = useState<BusinessFormData>({
        name: "",
        slug: "",
        bio: "",
        logo_url: "",
    })

    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})

    // Load initial data from store
    useEffect(() => {
        if (selectedRestaurant) {
            const data: BusinessFormData = {
                name: selectedRestaurant.name || "",
                slug: selectedRestaurant.slug || "",
                bio: selectedRestaurant.bio || "",
                logo_url: selectedRestaurant.logo_url || "",
            }
            setFormData(data)
            setInitialData(data)
        }
    }, [selectedRestaurant])

    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single
            .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    }

    const handleNameChange = (value: string) => {
        // Auto-generate slug if it hasn't been manually edited
        const generatedSlug = generateSlug(value)
        const shouldUpdateSlug = !formData.slug || formData.slug === generateSlug(formData.name)

        setFormData((prev) => ({
            ...prev,
            name: value,
            slug: shouldUpdateSlug ? generatedSlug : prev.slug,
        }))

        // Clear name error when user starts typing
        if (errors.name) {
            setErrors((prev) => ({ ...prev, name: undefined }))
        }
    }

    const handleSlugChange = (value: string) => {
        const formattedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, "") // Only allow lowercase letters, numbers, and hyphens

        setFormData((prev) => ({ ...prev, slug: formattedSlug }))

        // Clear slug error when user starts typing
        if (errors.slug) {
            setErrors((prev) => ({ ...prev, slug: undefined }))
        }
    }

    const handleBioChange = (value: string) => {
        setFormData((prev) => ({ ...prev, bio: value }))

        // Clear bio error when user starts typing
        if (errors.bio) {
            setErrors((prev) => ({ ...prev, bio: undefined }))
        }
    }

    const handleLogoUrlChange = (value: string) => {
        setFormData((prev) => ({ ...prev, logo_url: value }))
        // Clear logo URL error when user starts typing
        if (errors.logo_url) {
            setErrors((prev) => ({ ...prev, logo_url: undefined }))
        }
    }

    async function handleLogoFileChange(file?: File) {
        if (!file) return;
        // optional: quick client validation
        if (!file.type.startsWith("image/")) {
            setErrors((p) => ({ ...p, logo_url: "Please choose an image file" }));
            return;
        }
        setErrors((p) => ({ ...p, logo_url: undefined }));
        setUploadingLogo(true);
        try {
            const uploadedUrl = await uploadImage(file); // <- your existing uploader
            if (uploadedUrl) handleLogoUrlChange(uploadedUrl); // reuse same updater

        } catch (e) {
            console.log(e)
            setErrors((p) => ({ ...p, logo_url: "Upload failed. Try again." }));
        } finally {
            setUploadingLogo(false);
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Validate name
        try {
            nameSchema.parse(formData.name)
        } catch (error) {
            if (error instanceof z.ZodError) {
                newErrors.name = error.errors[0].message
            }
        }

        // Validate slug
        try {
            slugSchema.parse(formData.slug)
        } catch (error) {
            if (error instanceof z.ZodError) {
                newErrors.slug = error.errors[0].message
            }
        }

        // Validate bio (optional)
        if (formData.bio.trim()) {
            try {
                bioSchema.parse(formData.bio)
            } catch (error) {
                if (error instanceof z.ZodError) {
                    newErrors.bio = error.errors[0].message
                }
            }
        }

        // Validate logo URL (optional)
        if (formData.logo_url.trim()) {
            try {
                logoUrlSchema.parse(formData.logo_url)
            } catch (error) {
                if (error instanceof z.ZodError) {
                    newErrors.logo_url = error.errors[0].message
                }
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const resetForm = () => {
        setFormData(initialData)
        setErrors({})
        toast.success("Form reset to original values")
    }

    const saveBusinessInfo = async () => {
        if (!selectedRestaurant) {
            toast.error("No restaurant selected")
            return
        }

        if (!validateForm()) {
            toast.error("Please fix the errors before saving")
            return
        }

        try {
            setSaving(true)

            const updateData = {
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                bio: formData.bio.trim() || null,
                logo_url: formData.logo_url.trim() || null,
            }

            const response = await fetch(`/api/restaurants/${selectedRestaurant.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            })

            const result = await response.json()

            if (!response.ok) {
                if (response.status === 409) {
                    setErrors({ slug: result.error })
                    toast.error("Page URL already taken", {
                        description: "Please choose a different page URL",
                    })
                    return
                }
                throw new Error(result.error || "Failed to update business information")
            }

            // Update the store with the new data
            updateSelectedRestaurant(result.data)

            // Update initial data to reflect saved state
            const savedData: BusinessFormData = {
                name: result.data.name || "",
                slug: result.data.slug || "",
                bio: result.data.bio || "",
                logo_url: result.data.logo_url || "",
            }
            setInitialData(savedData)

            toast.success("Business information updated", {
                description: "Your business information has been updated successfully",
            })
        } catch (error: any) {
            console.error("Error updating business information:", error)
            toast.error("Error updating business information", {
                description: error.message || "An error occurred while updating your business information",
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
                    <CardDescription>Manage your restaurant&apos;s basic information and branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Restaurant Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Restaurant Name *</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Your Restaurant Name"
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Page URL/Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">Page URL *</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <div className="flex">
                                <span className="inline-flex items-center px-3 pl-9 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                    dineri.app/
                                </span>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="restaurant-name"
                                    className={`rounded-l-none focus:border-emerald-500 focus:ring-emerald-500 ${errors.slug ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                        }`}
                                />
                            </div>
                        </div>
                        {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                        <p className="text-xs text-gray-500">
                            This will be your restaurant&apos;s unique web address. Only lowercase letters, numbers, and hyphens allowed.
                        </p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleBioChange(e.target.value)}
                            placeholder="Tell customers about your restaurant..."
                            rows={3}
                            className={`focus:border-emerald-500 focus:ring-emerald-500 resize-none ${errors.bio ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                }`}
                        />
                        {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Optional: Brief description of your restaurant</span>
                            <span>{formData.bio.length}/200</span>
                        </div>
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-2">
                        <Label htmlFor="logo_url">Logo </Label>
                        <div className="relative">
                            <Input
                                id="logo_file"
                                type="file"
                                accept="image/*"
                                disabled={saving || uploadingLogo}
                                onChange={(e) => handleLogoFileChange(e.target.files?.[0])}
                            // className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-emerald-50 file:text-emerald-700 file:hover:bg-emerald-100 ${errors.logo_url ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200"
                            //     }`}
                            />
                            {uploadingLogo && (
                                <span className="absolute right-3 top-3 text-xs text-slate-500">Uploading…</span>
                            )}
                        </div>

                        {/* Logo Preview */}
                        {formData.logo_url && !errors.logo_url && (
                            <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <Image
                                        src={formData.logo_url || "/placeholder.svg"}
                                        alt="Logo preview"
                                        className="max-h-40 max-w-40 object-contain"
                                        width={200}
                                        height={200}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.style.display = "none"
                                            setErrors((prev) => ({ ...prev, logo_url: "Unable to load image from this URL" }))
                                        }}
                                        onLoad={() => {
                                            if (errors.logo_url === "Unable to load image from this URL") {
                                                setErrors((prev) => ({ ...prev, logo_url: undefined }))
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Floating Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: hasChanges ? 1 : 0,
                    y: hasChanges ? 0 : 20,
                }}
                className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 flex items-end sm:items-center sm:flex-row-reverse flex-col gap-2 sm:gap-4 z-50"
            >
                <div className="rounded-lg border bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>You have unsaved changes</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Reset Button */}
                    <Button
                        onClick={resetForm}
                        disabled={saving || !hasChanges}
                        size="lg"
                        variant="outline"
                        className="shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 bg-transparent"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>

                    {/* Save Button */}
                    <Button
                        onClick={saveBusinessInfo}
                        disabled={saving || !hasChanges}
                        size="lg"
                        className="bg-emerald-600 shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl disabled:opacity-50"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </motion.div>
        </>
    )
}
