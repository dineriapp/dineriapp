"use client"

import LoadingUI from "@/components/loading-ui"
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { Mail, MapPin, Phone } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"



interface FormErrors {
    email?: string
    phone?: string
    address?: string
    latitude?: string
    longitude?: string
}

interface ContactFormData {
    phone: string
    email: string
    address: string
    latitude: string
    longitude: string
}

export default function ContactPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
    const t = useTranslations("Settings.contact-information")

    // Validation schemas
    const emailSchema = z.string().email(t("form.errors.email_invalid")).min(1, t("form.errors.email_required"))

    const phoneSchema = z
        .string()
        .regex(/^\+?[\d\s\-().]{10,}$/, t("form.errors.phone_invalid"))
        .min(10, t("form.errors.phone_min"))

    const addressSchema = z
        .string()
        .min(10, t("form.errors.address_min"))
        .max(500, t("form.errors.address_max"))

    const latitudeSchema = z.preprocess(
        (val) => Number(val),
        z
            .number()
            .min(-90, t("form.errors.latitude_invalid"))
            .max(90, t("form.errors.latitude_invalid"))
    );

    const longitudeSchema = z.preprocess(
        (val) => Number(val),
        z
            .number()
            .min(-180, t("form.errors.longitude_invalid"))
            .max(180, t("form.errors.longitude_invalid"))
    );


    const [formData, setFormData] = useState<ContactFormData>({
        phone: "",
        email: "",
        address: "",
        latitude: "",
        longitude: "",
    })

    const [initialData, setInitialData] = useState<ContactFormData>({
        phone: "",
        email: "",
        address: "",
        latitude: "",
        longitude: "",
    })

    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})

    // Load initial data from store when selectedRestaurant changes
    useEffect(() => {
        if (selectedRestaurant) {
            const data = {
                phone: selectedRestaurant.phone || "",
                email: selectedRestaurant.email || "",
                address: selectedRestaurant.address || "",
                latitude: selectedRestaurant.latitude?.toString() || "",
                longitude: selectedRestaurant.longitude?.toString() || "",
            }

            setFormData(data)
            setInitialData(data)
            setHasChanges(false)
        }
    }, [selectedRestaurant])

    // Check for changes by comparing with initial data
    useEffect(() => {
        const hasFormChanges = Object.keys(formData).some(
            (key) => formData[key as keyof ContactFormData] !== initialData[key as keyof ContactFormData],
        )
        setHasChanges(hasFormChanges)
    }, [formData, initialData])

    // Format phone number as user types
    const formatPhoneNumber = (value: string) => {
        // Remove all non-numeric characters except + at the beginning
        const cleaned = value.replace(/[^\d+]/g, "")

        // If it starts with +, keep it, otherwise remove any + in the middle
        let formatted = cleaned
        if (cleaned.startsWith("+")) {
            formatted = "+" + cleaned.slice(1).replace(/\+/g, "")
        } else {
            formatted = cleaned.replace(/\+/g, "")
        }

        // Add formatting for US numbers
        if (formatted.length === 10 && !formatted.startsWith("+")) {
            formatted = `+1 (${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`
        } else if (formatted.length === 11 && formatted.startsWith("1")) {
            formatted = `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`
        }

        return formatted
    }

    const handleInputChange = (field: keyof ContactFormData, value: string) => {
        let processedValue = value

        // Special processing for phone numbers
        if (field === "phone") {
            processedValue = formatPhoneNumber(value)
        }

        // Special processing for coordinates
        if ((field === "latitude" || field === "longitude") && value !== "") {
            // Allow empty string, numbers, and decimal points
            if (!/^-?\d*\.?\d*$/.test(value)) {
                return // Don't update if invalid format
            }
        }

        setFormData((prev) => ({
            ...prev,
            [field]: processedValue,
        }))

        // Clear field-specific error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Validate email
        if (formData.email.trim()) {
            try {
                emailSchema.parse(formData.email)
            } catch (error) {
                if (error instanceof z.ZodError) {
                    newErrors.email = error.errors[0].message
                }
            }
        }

        // Validate phone
        if (formData.phone.trim()) {
            try {
                phoneSchema.parse(formData.phone)
            } catch (error) {
                if (error instanceof z.ZodError) {
                    newErrors.phone = error.errors[0].message
                }
            }
        }

        // Validate address
        if (formData.address.trim()) {
            try {
                addressSchema.parse(formData.address)
            } catch (error) {
                if (error instanceof z.ZodError) {
                    newErrors.address = error.errors[0].message
                }
            }
        }

        // Validate latitude
        if (formData.latitude.trim()) {
            try {
                latitudeSchema.parse(Number.parseFloat(formData.latitude))
            } catch (error) {
                if (error instanceof z.ZodError) {
                    newErrors.latitude = error.errors[0].message
                }
            }
        }

        // Validate longitude
        if (formData.longitude.trim()) {
            try {
                longitudeSchema.parse(Number.parseFloat(formData.longitude))
            } catch (error) {
                if (error instanceof z.ZodError) {
                    newErrors.longitude = error.errors[0].message
                }
            }
        }

        // Validate coordinates together
        const hasLatitude = formData.latitude.trim() !== ""
        const hasLongitude = formData.longitude.trim() !== ""

        if (hasLatitude && !hasLongitude) {
            newErrors.longitude = t("form.errors.longitude_required_with_latitude")
        }
        if (hasLongitude && !hasLatitude) {
            newErrors.latitude = t("form.errors.latitude_required_with_longitude")
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveContactInfo = async () => {
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
                email: formData.email.trim() || null,
                phone: formData.phone.trim() || null,
                address: formData.address.trim() || null,
                latitude: formData.latitude.trim() ? Number.parseFloat(formData.latitude) : null,
                longitude: formData.longitude.trim() ? Number.parseFloat(formData.longitude) : null,
            }

            const response = await fetch(`/api/restaurants/${selectedRestaurant.id}/contact`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || t("toasts.failed_to_save"))
            }

            // Update the store with the new data from API response
            updateSelectedRestaurant(result.data)

            // Update initial data to reflect saved state
            const newInitialData = {
                phone: result.data.phone || "",
                email: result.data.email || "",
                address: result.data.address || "",
                latitude: result.data.latitude?.toString() || "",
                longitude: result.data.longitude?.toString() || "",
            }
            setInitialData(newInitialData)

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

    const resetForm = () => {
        setFormData(initialData)
        setHasChanges(false)
        setSaving(false)
        setErrors({})
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
                    <CardTitle className="text-gray-900">
                        {t("page.title")}
                    </CardTitle>
                    <CardDescription>
                        {t("page.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Email Address - Now Editable */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            {t("form.labels.email")}
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder={t("form.placeholders.email")}
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                        <p className="text-xs text-gray-500">
                            {t("form.help.email")}
                        </p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            {t("form.labels.phone")}
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder={t("form.placeholders.phone")}
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                        <p className="text-xs text-gray-500">
                            {t("form.help.phone")}
                        </p>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">
                            {t("form.labels.address")}
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder={t("form.placeholders.address")}
                                rows={3}
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 resize-none ${errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                        <p className="text-xs text-gray-500">
                            {t("form.help.address")}
                        </p>
                    </div>

                </CardContent>
            </Card>

            {/* Floating Save Button */}
            <UnsavedChangesPanel
                hasChanges={hasChanges}
                saving={saving}
                resetForm={resetForm}
                saveSettings={saveContactInfo}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />
        </>
    )
}
