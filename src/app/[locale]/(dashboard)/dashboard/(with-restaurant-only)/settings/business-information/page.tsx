"use client"

import LoadingUI from "@/components/loading-ui"
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { uploadImage } from "@/supabase/clients/client"
import { Building2, Globe, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

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
    const t = useTranslations("Settings.business-information")
    // Validation schemas
    const nameSchema = z
        .string()
        .min(1, t("form.errors.name_required"))
        .max(100, t("form.errors.name_max"))

    const slugSchema = z
        .string()
        .min(3, t("form.errors.slug_required"))
        .max(50, t("form.errors.slug_max"))
        .regex(/^[a-z0-9-]+$/, t("form.errors.slug_invalid"))

    const bioSchema = z.string().max(200, t("form.errors.bio_max"))

    const logoUrlSchema = z.string().url(t("form.errors.logo_invalid"))

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
            setErrors((p) => ({ ...p, logo_url: t("form.errors.logo_upload_not_file") }));
            return;
        }
        setErrors((p) => ({ ...p, logo_url: undefined }));
        setUploadingLogo(true);
        try {
            const uploadedUrl = await uploadImage(file); // <- your existing uploader
            if (uploadedUrl) handleLogoUrlChange(uploadedUrl); // reuse same updater

        } catch (e) {
            console.log(e)
            setErrors((p) => ({ ...p, logo_url: t("form.errors.logo_upload_failed") }));
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
        toast.success(t("toasts.reset_success"))
    }

    const saveBusinessInfo = async () => {
        if (!selectedRestaurant) {
            toast.error(t("toasts.no_restaurant"))
            return
        }

        if (!validateForm()) {
            toast.error(t("toasts.fix_errors"))
            return
        }

        try {
            setSaving(true)

            const updateData = {
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                bio: formData.bio.trim() || "",
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
                    toast.error(t("toasts.slug_taken_title"), {
                        description: t("toasts.slug_taken_description"),
                    })
                    return
                }
                throw new Error(result.error || t("toasts.failed_to_save"))
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

            toast.success(t("toasts.update_success_title"), {
                description: t("toasts.update_success_description"),
            })
        } catch (error: any) {
            console.error(t("toasts.update_error_title"), error)
            toast.error(t("toasts.update_error_title"), {
                description: error.message || t("toasts.update_error_description"),
            })
        } finally {
            setSaving(false)
        }
    }

    if (!selectedRestaurant) {
        return (
            <LoadingUI text={t("loading.text")} />
        )
    }

    return (
        <>
            <Card className="border-gray-200 pt-0 box-shad-every-2 shadow-md">
                <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                    <CardTitle className="text-gray-900">{t("page.title")}</CardTitle>
                    <CardDescription>{t("page.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Restaurant Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("form.labels.name")}</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder={t("form.placeholders.name")}
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Page URL/Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">
                            {t("form.labels.slug")}
                        </Label>
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
                                    placeholder={t("form.placeholders.slug")}
                                    className={`rounded-l-none focus:border-emerald-500 focus:ring-emerald-500 ${errors.slug ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                        }`}
                                />
                            </div>
                        </div>
                        {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                        <p className="text-xs text-gray-500">
                            {t("form.help.slug")}
                        </p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">
                            {t("form.labels.bio")}
                        </Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleBioChange(e.target.value)}
                            placeholder={t("form.placeholders.bio")}
                            rows={3}
                            className={`focus:border-emerald-500 focus:ring-emerald-500 resize-none ${errors.bio ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                }`}
                        />
                        {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>
                                {t("form.help.bio_optional")}
                            </span>
                            <span>{formData.bio.length}/200</span>
                        </div>
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-2">
                        <Label htmlFor="logo_url">
                            {t("form.labels.logo")}
                        </Label>
                        <div className="relative">
                            {/* Hidden file input */}
                            <Input
                                id="logo_file"
                                type="file"
                                accept="image/*"
                                disabled={saving || uploadingLogo}
                                onChange={(e) => handleLogoFileChange(e.target.files?.[0])}
                                className="hidden"
                            />

                            {/* Upload button */}
                            <Button
                                type="button"
                                disabled={saving || uploadingLogo}
                                onClick={() => document.getElementById("logo_file")?.click()}
                                className="w-full text-sm! cursor-pointer"
                                variant={"outline"}
                            >
                                <Upload />
                                {uploadingLogo ? (
                                    <>
                                        {t("form.upload.uploading")}
                                    </>
                                )
                                    :
                                    <>
                                        {t("uplaod")}
                                    </>
                                }
                            </Button>
                        </div>

                        {/* Logo Preview */}
                        {formData.logo_url && !errors.logo_url && (
                            <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    {t("form.help.logo_preview")}
                                </p>
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
            <UnsavedChangesPanel
                hasChanges={hasChanges}
                saving={saving}
                resetForm={resetForm}
                saveSettings={saveBusinessInfo}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />

        </>
    )
}
