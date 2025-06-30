"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Facebook, Instagram, MessageCircle, Save } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Mock social media data
const mockSocialData = {
  instagram: "https://instagram.com/bellavista.restaurant",
  facebook: "https://facebook.com/bellavista.restaurant",
  whatsapp: "+15551234567",
  social_icons_position: "top" as "top" | "bottom",
}

export default function SocialPage() {
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [socialIconsPosition, setSocialIconsPosition] = useState<"top" | "bottom">("top")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)
      setTimeout(() => {
        const data = mockSocialData
        setInstagram(data.instagram || "")
        setFacebook(data.facebook || "")
        setWhatsapp(data.whatsapp || "")
        setSocialIconsPosition(data.social_icons_position || "top")
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
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Social media settings updated", {
        description: "Your social media information has been updated successfully",
      })
      setHasChanges(false)
    } catch (error: any) {
      toast.error("Error updating social media settings", {
        description: error.message || "An error occurred while updating your social media settings",
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
          <span>Loading social media settings...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50">
          <CardTitle className="text-gray-900">Social Media</CardTitle>
          <CardDescription>Connect your social media accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Profile URL</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => handleInputChange(setInstagram, e.target.value)}
                placeholder="https://instagram.com/your.restaurant"
                className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <div className="relative">
              <Facebook className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
              <Input
                id="facebook"
                value={facebook}
                onChange={(e) => handleInputChange(setFacebook, e.target.value)}
                placeholder="https://facebook.com/your.restaurant"
                className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => handleInputChange(setWhatsapp, e.target.value)}
                placeholder="+1234567890"
                className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your WhatsApp number with country code (e.g., +1234567890)
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label>Social Icons Position</Label>
            <Select
              value={socialIconsPosition}
              onValueChange={(value: "top" | "bottom") => {
                setSocialIconsPosition(value)
                setHasChanges(true)
              }}
            >
              <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Below</SelectItem>
              </SelectContent>
            </Select>
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
