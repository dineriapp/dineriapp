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

    // Validation schemas
    const emailSchema = z.string().email("Please enter a valid email address").min(1, "Email is required")

    const phoneSchema = z
        .string()
        .regex(/^\+?[\d\s\-().]{10,}$/, "Please enter a valid phone number")
        .min(10, "Phone number must be at least 10 digits")

    const addressSchema = z
        .string()
        .min(10, "Address must be at least 10 characters")
        .max(500, "Address must be less than 500 characters")

    const latitudeSchema = z.preprocess(
        (val) => Number(val),
        z
            .number()
            .min(-90, "Latitude must be between -90 and 90")
            .max(90, "Latitude must be between -90 and 90")
    );

    const longitudeSchema = z.preprocess(
        (val) => Number(val),
        z
            .number()
            .min(-180, "Longitude must be between -180 and 180")
            .max(180, "Longitude must be between -180 and 180")
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
            newErrors.longitude = "Longitude is required when latitude is provided"
        }
        if (hasLongitude && !hasLatitude) {
            newErrors.latitude = "Latitude is required when longitude is provided"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveContactInfo = async () => {
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
                throw new Error(result.error || "Failed to update contact information")
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

            toast.success("Contact information updated", {
                description: "Your contact information has been updated successfully",
            })
        } catch (error: any) {
            console.error("Error updating contact information:", error)
            toast.error("Error updating contact information", {
                description: error.message || "An error occurred while updating your contact information",
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
            <LoadingUI text="Loading contact information..." />

        )
    }

    return (
        <>
            <Card className="border-gray-200 pt-0 box-shad-every-2 shadow-md">
                <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                    <CardTitle className="text-gray-900">Contact Information</CardTitle>
                    <CardDescription>Manage your restaurant&apos;s contact details and location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Email Address - Now Editable */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="contact@restaurant.com"
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                        <p className="text-xs text-gray-500">Primary contact email for your restaurant</p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                        <p className="text-xs text-gray-500">Include country code for international numbers</p>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="123 Restaurant Street, City, State, Country"
                                rows={3}
                                className={`pl-10 focus:border-emerald-500 focus:ring-emerald-500 resize-none ${errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                        <p className="text-xs text-gray-500">Full address including city, state/province, and country</p>
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
