"use client"

import LoadingUI from "@/components/loading-ui"
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { AlertCircle, Facebook, Instagram, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { FaTiktok } from "react-icons/fa"
import { toast } from "sonner"

interface SocialFormData {
  instagram: string
  facebook: string
  tiktok: string
  whatsapp: string
  social_icons_position: "top" | "bottom"
}

export default function SocialPage() {
  const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
  const t = useTranslations("Settings.social")

  const [formData, setFormData] = useState<SocialFormData>({
    instagram: "",
    facebook: "",
    tiktok: "",
    whatsapp: "",
    social_icons_position: "top",
  })

  const [initialData, setInitialData] = useState<SocialFormData>({
    instagram: "",
    facebook: "",
    whatsapp: "",
    tiktok: "",
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
        tiktok: selectedRestaurant.tiktok || "",
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
        return t("errors.instagram_invalid")
      }
      if (platform === "facebook" && !url.includes("facebook.com")) {
        return t("errors.facebook_invalid")
      }
      return null
    } catch {
      return t("errors.url_invalid", { platform: platform })
    }
  }

  // Validate WhatsApp number
  const validateWhatsApp = (number: string): string | null => {
    if (!number) return null

    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(number)) {
      return t("errors.whatsapp_invalid")
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
    toast.success(t("toasts.form_reset_title"), {
      description: t("toasts.form_reset_description"),
    })
  }

  // Save social media settings
  const saveSocialSettings = async () => {
    if (!selectedRestaurant) {
      toast.error(t("errors.noRestaurant"))
      return
    }

    if (!validateForm()) {
      toast.error(t("errors.fixBeforeSave"))
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
        throw new Error(result.error || t("errors.updateError_title"))
      }

      // Update store with response data
      updateSelectedRestaurant(result.data)

      // Update initial data to reflect saved state
      setInitialData(formData)

      toast.success(t("toasts.update_success_title"), {
        description: t("toasts.update_success_description"),
      })
    } catch (error: any) {
      console.error(t("errors.updateError_title"), error)
      toast.error(t("errors.updateError_title"), {
        description: error.message || t("errors.updateError_description"),
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
      <Card className="pt-0 box-shad-every-2 shadow-md border-gray-200">
        <CardHeader className="bg-gray-50/50 font-poppins py-4">
          <CardTitle className="text-gray-900">
            {t("page.title")}
          </CardTitle>
          <CardDescription>
            {t("page.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="instagram">
              {t("form.labels.instagram")}
            </Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-3 h-4 w-4 text-pink-600" />
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                placeholder={t("form.placeholders.instagram")}
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
              {t("form.help.instagram")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">
              {t("form.labels.facebook")}
            </Label>
            <div className="relative">
              <Facebook className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
              <Input
                id="facebook"
                value={formData.facebook}
                onChange={(e) => handleInputChange("facebook", e.target.value)}
                placeholder={t("form.placeholders.facebook")}
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
              {t("form.help.facebook")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">
              {t("form.labels.whatsapp")}

            </Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-green-600" />
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                placeholder={t("form.placeholders.whatsapp")}
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
              {t("form.help.whatsapp")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok">
              {t("form.labels.tiktok")}
            </Label>
            <div className="relative">
              {/* Replace with a TikTok icon SVG or component */}
              <FaTiktok className="absolute left-3 top-3 h-4 w-4" />
              <Input
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) => {
                  let value = e.target.value;
                  // Always ensure it starts with "@"
                  if (value && !value.startsWith("@")) {
                    value = "" + value;
                  }
                  handleInputChange("tiktok", value);
                }}
                placeholder={t("form.placeholders.tiktok")}
                className={`pl-10 focus:border-pink-500 focus:ring-pink-500 ${errors.tiktok
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
                  }`}
              />
            </div>
            {errors.tiktok && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.tiktok}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("form.help.tiktok")}
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label>
              {t("form.labels.social_icons_position")}
            </Label>
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
                <SelectItem value="top">
                  {t("form.selectOptions.top")}
                </SelectItem>
                <SelectItem value="bottom">
                  {t("form.selectOptions.bottom")}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("form.help.social_icons_position")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Buttons */}
      <UnsavedChangesPanel
        hasChanges={hasChanges}
        saving={saving}
        resetForm={resetForm}
        saveSettings={saveSocialSettings}
        UnsavedChangesUi={UnsavedChangesUi}
        ResetChangesBtnClasses={ResetChangesBtnClasses}
        SaveChangesBtnClasses={SaveChangesBtnClasses}
      />
    </>
  )
}
