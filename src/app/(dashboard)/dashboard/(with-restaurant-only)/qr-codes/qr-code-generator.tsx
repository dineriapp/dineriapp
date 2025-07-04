"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLinks } from "@/lib/link-queries"
import { QRCodeGenerator } from "@/lib/qr-generator"
import { useCreateQRCode } from "@/lib/qr-queries"
import { Download, QrCode } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"


interface QRCodeGeneratorProps {
    restaurant: any
}

export function QRCodeGeneratorComponent({ restaurant }: QRCodeGeneratorProps) {
    const [formData, setFormData] = useState({
        name: "",
        type: "restaurant_page" as "restaurant_page" | "link" | "custom",
        link_id: "",
        custom_url: "",
        size: 1000,
        color: "#000000",
        include_logo: true,
        include_frame: true,
        frame_text: "Scan for Menu & More",
    })

    const { data: links } = useLinks(restaurant.id)
    const [qrDataUrl, setQrDataUrl] = useState<string>("")
    const [generating, setGenerating] = useState(false)

    const createQRCodeMutation = useCreateQRCode(restaurant?.id || "")

    useEffect(() => {
        generatePreview()
    }, [formData, restaurant])


    const generatePreview = async () => {
        if (!restaurant) return

        setGenerating(true)
        try {
            let targetUrl = ""
            switch (formData.type) {
                case "restaurant_page":
                    targetUrl = `${window.location.origin}/${restaurant.slug}`
                    break
                case "link":
                    const selectedLink = links?.find((l) => l.id === formData.link_id)
                    targetUrl = selectedLink?.url || ""
                    break
                case "custom":
                    targetUrl = formData.custom_url
                    break
            }

            if (targetUrl) {
                // For preview, use the actual target URL instead of scan URL
                const dataUrl = await QRCodeGenerator.generateBrandedQR(targetUrl, {
                    size: formData.size,
                    accentColor: formData.color,
                    logoUrl: formData.include_logo ? restaurant.logo_url : undefined,
                    includeFrame: formData.include_frame,
                    frameText: formData.include_frame ? formData.frame_text : undefined,
                    restaurantName: restaurant.name,
                })
                setQrDataUrl(dataUrl)
            }
        } catch (error) {
            console.error("Error generating preview:", error)
            // Fallback to basic QR code
            try {
                let targetUrl = ""
                switch (formData.type) {
                    case "restaurant_page":
                        targetUrl = `${window.location.origin}/${restaurant.slug}`
                        break
                    case "link":
                        const selectedLink = links?.find((l) => l.id === formData.link_id)
                        targetUrl = selectedLink?.url || ""
                        break
                    case "custom":
                        targetUrl = formData.custom_url
                        break
                }

                if (targetUrl) {
                    const basicQR = await QRCodeGenerator.generateBasicQR(targetUrl, {
                        size: formData.size,
                        color: {
                            dark: formData.color,
                            light: "#FFFFFF",
                        },
                    })
                    setQrDataUrl(basicQR)
                }
            } catch (fallbackError) {
                console.error("Error generating fallback QR code:", fallbackError)
            }
        } finally {
            setGenerating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurant?.id) return

        if (!formData.name.trim()) {
            toast.error("Please enter a name for your QR code")
            return
        }

        if (formData.type === "link" && !formData.link_id) {
            toast.error("Please select a link")
            return
        }

        if (formData.type === "custom" && !formData.custom_url.trim()) {
            toast.error("Please enter a custom URL")
            return
        }

        try {
            await createQRCodeMutation.mutateAsync({ ...formData, qrDataUrl: qrDataUrl })

            // Reset form
            setFormData({
                name: "",
                type: "restaurant_page",
                link_id: "",
                custom_url: "",
                size: 300,
                color: "#000000",
                include_logo: true,
                include_frame: false,
                frame_text: "Scan for Menu & More",
            })
        } catch {
            // Error handling is done in the mutation
        }
    }

    const downloadPreview = () => {
        if (!qrDataUrl) {
            toast.error("No QR code to download")
            return
        }

        const link = document.createElement("a")
        link.download = `${formData.name || "qr-code"}.png`
        link.href = qrDataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("QR code preview downloaded!")
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Generate QR Code</CardTitle>
                    <CardDescription>Create a branded QR code for your restaurant</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">QR Code Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Main Menu QR Code"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">QR Code Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) =>
                                    setFormData((prev) => ({ ...prev, type: value, link_id: "", custom_url: "" }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restaurant_page">Restaurant Page</SelectItem>
                                    <SelectItem value="link">Existing Link</SelectItem>
                                    <SelectItem value="custom">Custom URL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type === "link" && (
                            <div className="space-y-2 w-full">
                                <Label htmlFor="link">Select Link</Label>
                                <Select
                                    value={formData.link_id}

                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, link_id: value }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a link" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {links?.map((link) => (
                                            <SelectItem key={link.id} value={link.id}>
                                                {link.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formData.type === "custom" && (
                            <div>
                                <Label htmlFor="custom_url">Custom URL</Label>
                                <Input
                                    id="custom_url"
                                    type="url"
                                    value={formData.custom_url}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, custom_url: e.target.value }))}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {/* <div className="space-y-2 w-full">
                                <Label htmlFor="size">Size (px)</Label>
                                <Input
                                    id="size"
                                    type="number"
                                    min="100"
                                    max="1000"
                                    value={formData.size}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, size: Number.parseInt(e.target.value) }))}
                                />
                            </div> */}
                            <div className="space-y-2 w-full">
                                <Label htmlFor="color">Color</Label>
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="include_logo"
                                checked={formData.include_logo}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, include_logo: checked }))}
                            />
                            <Label htmlFor="include_logo">Include Restaurant Logo</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="include_frame"
                                checked={formData.include_frame}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, include_frame: checked }))}
                            />
                            <Label htmlFor="include_frame">Include Frame Text</Label>
                        </div>

                        {formData.include_frame && (
                            <div>
                                <Label htmlFor="frame_text">Frame Text</Label>
                                <Input
                                    id="frame_text"
                                    value={formData.frame_text}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, frame_text: e.target.value }))}
                                    placeholder="Scan for Menu & More"
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full h-[44px]" disabled={createQRCodeMutation.isPending}>
                            {createQRCodeMutation.isPending ? "Creating..." : "Create QR Code"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="w-full h-full">
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 items-center space-y-4">
                    {generating ? (
                        <div className="flex items-center min-h-[360px] justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-center">
                                <QrCode className="mx-auto h-8 w-8 text-gray-400 animate-pulse" />
                                <p className="mt-2 text-sm text-gray-500">Generating...</p>
                            </div>
                        </div>
                    ) : qrDataUrl ? (
                        <div className="text-center min-h-[360px] ">
                            <div className="w-full">
                                <img
                                    src={qrDataUrl || "/placeholder.svg"}
                                    alt="QR Code Preview"
                                    className="w-full border rounded-lg shadow-sm"
                                    style={{ width: Math.min(formData.size, 300), height: Math.min(formData.size, 300) }}
                                />
                            </div>
                            <div className="flex gap-2 mt-4 w-full">
                                <Button onClick={downloadPreview} variant="outline" className="w-full h-[44px]">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Preview
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center min-h-[360px] justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-center">
                                <QrCode className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">QR code will appear here</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
