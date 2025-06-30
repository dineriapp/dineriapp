"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Facebook, Instagram, MessageCircle, RotateCcw, Save } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRestaurantStore } from "@/stores/restaurant-store"

interface SocialFormData {
  instagram: string
  facebook: string
  whatsapp: string
  social_icons_position: "top" | "bottom"
}

export default function SocialPage() {
  const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()

  const [formData, setFormData] = useState<SocialFormData>({
    instagram: "",
    facebook: "",
    whatsapp: "",
    social_icons_position: "top",
  })

  const [initialData, setInitialData] = useState<SocialFormData>({
    instagram: "",
    facebook: "",
    whatsapp: "",
    social_icons_position: "top",
  })

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<SocialFormData>>({})

  // Load initial data from restaurant store
  useEffect(() => {
    if (selectedRestaurant) {
      const data: SocialFormData = {
        instagram: selectedRestaurant.instagram || "",
        facebook: selectedRestaurant.facebook || "",
        whatsapp: selectedRestaurant.whatsapp || "",
        social_icons_position: selectedRestaurant.social_icons_position || "top",
      }
      setFormData(data)
      setInitialData(data)
    }
  }, [selectedRestaurant])

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

  // Validate URL format
  const validateUrl = (url: string, platform: string): string | null => {
    if (!url) return null

    try {
      new URL(url)
      if (platform === "instagram" && !url.includes("instagram.com")) {
        return "Please enter a valid Instagram URL"
      }
      if (platform === "facebook" && !url.includes("facebook.com")) {
        return "Please enter a valid Facebook URL"
      }
      return null
    } catch {
      return `Please enter a valid ${platform} URL`
    }
  }

  // Validate WhatsApp number
  const validateWhatsApp = (number: string): string | null => {
    if (!number) return null

    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(number)) {
      return "Please enter a valid WhatsApp number with country code (e.g., +1234567890)"
    }
    return null
  }

  // Handle input changes
  const handleInputChange = (field: keyof SocialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<SocialFormData> = {}

    // Validate Instagram URL
    if (formData.instagram) {
      const instagramError = validateUrl(formData.instagram, "instagram")
      if (instagramError) newErrors.instagram = instagramError
    }

    // Validate Facebook URL
    if (formData.facebook) {
      const facebookError = validateUrl(formData.facebook, "facebook")
      if (facebookError) newErrors.facebook = facebookError
    }

    // Validate WhatsApp number
    if (formData.whatsapp) {
      const whatsappError = validateWhatsApp(formData.whatsapp)
      if (whatsappError) newErrors.whatsapp = whatsappError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialData)
    setErrors({})
    toast.success("Form reset", {
      description: "All changes have been discarded",
    })
  }

  // Save social media settings
  const saveSocialSettings = async () => {
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

      const response = await fetch(`/api/restaurants/${selectedRestaurant.id}/social`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update social media settings")
      }

      // Update store with response data
      updateSelectedRestaurant(result.data)

      // Update initial data to reflect saved state
      setInitialData(formData)

      toast.success("Social media settings updated", {
        description: "Your social media information has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating social media settings:", error)
      toast.error("Error updating social media settings", {
        description: error.message || "An error occurred while updating your social media settings",
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
          <span>Loading social information...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50">
          <CardTitle className="text-gray-900">Social Media</CardTitle>
          <CardDescription>Connect your social media accounts and manage how they appear</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Profile URL</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-3 h-4 w-4 text-pink-600" />
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                placeholder="https://instagram.com/your.restaurant"
                className={`pl-10 focus:border-pink-500 focus:ring-pink-500 ${errors.instagram ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
              />
            </div>
            {errors.instagram && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.instagram}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your Instagram profile URL (e.g., https://instagram.com/yourrestaurant)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook Page URL</Label>
            <div className="relative">
              <Facebook className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
              <Input
                id="facebook"
                value={formData.facebook}
                onChange={(e) => handleInputChange("facebook", e.target.value)}
                placeholder="https://facebook.com/your.restaurant"
                className={`pl-10 focus:border-blue-500 focus:ring-blue-500 ${errors.facebook ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
              />
            </div>
            {errors.facebook && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.facebook}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your Facebook page URL (e.g., https://facebook.com/yourrestaurant)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-green-600" />
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                placeholder="+1234567890"
                className={`pl-10 focus:border-green-500 focus:ring-green-500 ${errors.whatsapp ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
              />
            </div>
            {errors.whatsapp && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.whatsapp}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your WhatsApp number with country code (e.g., +1234567890)
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label>Social Icons Position</Label>
            <Select
              value={formData.social_icons_position}
              onValueChange={(value: "top" | "bottom") => {
                handleInputChange("social_icons_position", value)
              }}
            >
              <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top of page</SelectItem>
                <SelectItem value="bottom">Bottom of page</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose where social media icons appear on your restaurant page
            </p>
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
            size="lg"
            variant="outline"
            className="shadow-lg bg-transparent"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={saveSocialSettings}
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
