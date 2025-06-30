"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Mail, MapPin, Phone, Save } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Mock restaurant data
const mockRestaurant = {
    phone: "+1 (555) 123-4567",
    email: "info@bellavista.com",
    address: "123 Restaurant Street, Downtown, New York, NY 10001",
    latitude: 40.7128,
    longitude: -74.006,
}

export default function ContactPage() {
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [latitude, setLatitude] = useState<number | undefined>()
    const [longitude, setLongitude] = useState<number | undefined>()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        const loadData = () => {
            setLoading(true)
            setTimeout(() => {
                const data = mockRestaurant
                setPhone(data.phone || "")
                setEmail(data.email || "")
                setAddress(data.address || "")
                setLatitude(data.latitude)
                setLongitude(data.longitude)
                setLoading(false)
            }, 400)
        }
        loadData()
    }, [])

    const handleInputChange = (setter: any, value: string | number) => {
        setter(value)
        setHasChanges(true)
    }

    const saveProfile = async () => {
        try {
            setSaving(true)
            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success("Contact information updated", {
                description: "Your contact information has been updated successfully",
            })
            setHasChanges(false)
        } catch (error: any) {
            toast.error("Error updating contact information", {
                description: error.message || "An error occurred while updating your contact information",
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
                    <span>Loading contact information...</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50/50">
                    <CardTitle className="text-gray-900">Contact Information</CardTitle>
                    <CardDescription>Add your contact details and location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => handleInputChange(setPhone, e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                                placeholder="contact@example.com"
                                className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <Textarea
                                id="address"
                                value={address}
                                onChange={(e) => handleInputChange(setAddress, e.target.value)}
                                placeholder="123 Restaurant Street, City, Country"
                                rows={2}
                                className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                value={latitude || ""}
                                onChange={(e) =>
                                    handleInputChange(setLatitude, e.target.value ? Number.parseFloat(e.target.value) : "")
                                }
                                placeholder="e.g. 40.7128"
                                className="focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                value={longitude || ""}
                                onChange={(e) =>
                                    handleInputChange(setLongitude, e.target.value ? Number.parseFloat(e.target.value) : "")
                                }
                                placeholder="e.g. -74.0060"
                                className="focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
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
