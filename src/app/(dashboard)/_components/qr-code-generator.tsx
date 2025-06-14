"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import { Download, QrCode, Palette, Type, Copy, Check, Loader2, Share2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { QRCodeGenerator, QR_CODE_TEMPLATES, type QRCodeTemplate } from "@/lib/qr-generator"
import type { Restaurant } from "@/lib/types"

interface QRCodeGeneratorProps {
    restaurant: Restaurant
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function QRCodeGeneratorComponent({ restaurant }: QRCodeGeneratorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<QRCodeTemplate>(QR_CODE_TEMPLATES[0])
    const [customUrl, setCustomUrl] = useState("")
    const [customFrameText, setCustomFrameText] = useState("")
    const [qrSize, setQrSize] = useState(300)
    const [includeLogo, setIncludeLogo] = useState(false)
    const [includeFrame, setIncludeFrame] = useState(false)
    const [qrColor, setQrColor] = useState(restaurant.accent_color || "#0891b2")
    const [generatedQR, setGeneratedQR] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Debounce custom URL and frame text to prevent constant regeneration
    const debouncedCustomUrl = useDebounce(customUrl, 800)
    const debouncedCustomFrameText = useDebounce(customFrameText, 800)

    const generateQRUrl = (template: QRCodeTemplate): string => {
        const baseUrl = "https://dineri.app"

        switch (template.type) {
            case "restaurant_page":
                return `${baseUrl}/${restaurant.slug}`
            case "menu":
                return `${baseUrl}/${restaurant.slug}#menu`
            case "events":
                return `${baseUrl}/${restaurant.slug}#events`
            case "review":
                return `${baseUrl}/review/${restaurant.slug}`
            case "social":
                return restaurant.instagram || `${baseUrl}/${restaurant.slug}`
            default:
                return debouncedCustomUrl || `${baseUrl}/${restaurant.slug}`
        }
    }

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    const handleGenerateQR = useCallback(async () => {
        setIsGenerating(true)
        setError(null)

        try {
            const url = selectedTemplate.id === "custom" ? debouncedCustomUrl : generateQRUrl(selectedTemplate)
            const frameText = selectedTemplate.id === "custom" ? debouncedCustomFrameText : selectedTemplate.frameText

            if (!url) {
                throw new Error("Please provide a valid URL")
            }

            if (!validateUrl(url)) {
                throw new Error("Please enter a valid URL (must include http:// or https://)")
            }

            // Only include logo if both toggle is on AND restaurant has a logo
            const shouldIncludeLogo = includeLogo && restaurant.logo_url

            const qrDataUrl = await QRCodeGenerator.generateBrandedQRCode(url, {
                size: qrSize,
                accentColor: qrColor,
                logoUrl: shouldIncludeLogo ? restaurant.logo_url ? restaurant.logo_url : undefined : undefined,
                includeFrame,
                frameText: includeFrame ? frameText : undefined,
                restaurantName: restaurant.name,
                errorCorrectionLevel: shouldIncludeLogo ? "H" : "M", // Higher error correction when logo is present
            })

            setGeneratedQR(qrDataUrl)
            toast.success(shouldIncludeLogo ? "QR code with logo generated successfully" : "QR code generated successfully")
        } catch (error: any) {
            const errorMessage = error.message || "Failed to generate QR code"
            setError(errorMessage)
            toast.error(errorMessage)
            console.error("QR Generation Error:", error)
        } finally {
            setIsGenerating(false)
        }
    }, [
        selectedTemplate,
        debouncedCustomUrl,
        debouncedCustomFrameText,
        qrSize,
        qrColor,
        includeLogo,
        includeFrame,
        restaurant,
    ])

    const handleDownload = async (format: "png" | "svg" = "png") => {
        if (!generatedQR) return

        try {
            const filename = `${restaurant.slug}-qr-${selectedTemplate.id}.${format}`

            if (format === "svg") {
                const svgUrl = await QRCodeGenerator.convertToSVG(generatedQR)
                QRCodeGenerator.downloadQRCode(svgUrl, filename)
                URL.revokeObjectURL(svgUrl) // Clean up
            } else {
                QRCodeGenerator.downloadQRCode(generatedQR, filename)
            }

            toast.success(`QR code saved as ${filename}`)
        } catch (error) {
            toast.error(`Failed to download QR code as ${format.toUpperCase()}`)
            console.error("Download Error:", error)
        }
    }

    const handleCopyUrl = async () => {
        const url = selectedTemplate.id === "custom" ? debouncedCustomUrl : generateQRUrl(selectedTemplate)

        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success("QR code URL copied to clipboard")
        } catch {
            toast.error("Failed to copy URL to clipboard")
        }
    }

    const handleTemplateChange = (templateId: string) => {
        const template = QR_CODE_TEMPLATES.find((t) => t.id === templateId)
        if (template) {
            setSelectedTemplate(template)
            setError(null) // Clear any previous errors
        } else if (templateId === "custom") {
            // Create a custom template object
            setSelectedTemplate({
                id: "custom",
                name: "Custom URL",
                description: "Enter your own URL",
                frameText: "Scan for more info",
                type: "custom",
                urlPattern: "{custom_url}",
            })
            setError(null)
        }
    }

    const handleLogoToggle = (checked: boolean) => {
        if (!restaurant.logo_url && checked) {
            toast.error("Please upload a logo in your restaurant settings first")
            setIncludeLogo(false)
            return
        }
        setIncludeLogo(checked)
    }

    const handleCustomUrlChange = (value: string) => {
        setCustomUrl(value)
        setError(null) // Clear error when user starts typing
    }

    // Auto-generate QR code when template changes (but not for custom URL)
    useEffect(() => {
        if (selectedTemplate && selectedTemplate.id !== "custom") {
            handleGenerateQR()
        }
    }, [selectedTemplate, qrSize, qrColor, includeLogo, includeFrame, handleGenerateQR])

    // Auto-generate QR code for custom URL when debounced values change
    useEffect(() => {
        if (selectedTemplate?.id === "custom" && debouncedCustomUrl) {
            handleGenerateQR()
        }
    }, [
        selectedTemplate,
        debouncedCustomUrl,
        debouncedCustomFrameText,
        qrSize,
        qrColor,
        includeLogo,
        includeFrame,
        handleGenerateQR,
    ])

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-teal-600" />
                                QR Code Generator
                            </CardTitle>
                            <CardDescription>Create branded QR codes for your restaurant</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Template Selection */}
                            <div className="space-y-3">
                                <Label>QR Code Type</Label>
                                <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                                    <SelectTrigger className="!py-2">
                                        <SelectValue className="!py-2" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {QR_CODE_TEMPLATES.map((template) => (
                                            <SelectItem key={template.id} value={template.id} className="">
                                                <div className="flex flex-col items-start !py-1">
                                                    <span>{template.name}</span>
                                                    <span className="text-xs text-muted-foreground">{template.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="custom">
                                            <div className="flex flex-col">
                                                <span>Custom URL</span>
                                                <span className="text-xs text-muted-foreground">Enter your own URL</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Custom URL Input */}
                            {selectedTemplate.id === "custom" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-url">Custom URL</Label>
                                        <Input
                                            id="custom-url"
                                            type="url"
                                            value={customUrl}
                                            onChange={(e) => handleCustomUrlChange(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter the complete URL you want the QR code to link to
                                            {customUrl && customUrl !== debouncedCustomUrl && (
                                                <span className="text-amber-600 ml-1">(generating in a moment...)</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-frame">Frame Text (Optional)</Label>
                                        <Input
                                            id="custom-frame"
                                            value={customFrameText}
                                            onChange={(e) => setCustomFrameText(e.target.value)}
                                            placeholder="Scan for more info"
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground">Text to display below the QR code</p>
                                    </div>
                                </div>
                            )}

                            {/* URL Preview - Only show for preset templates, not custom */}
                            {selectedTemplate.id !== "custom" && (
                                <div className="space-y-2">
                                    <Label>QR Code URL</Label>
                                    <div className="flex items-center gap-2">
                                        <Input value={generateQRUrl(selectedTemplate)} readOnly className="bg-muted" />
                                        <Button variant="outline" size="sm" onClick={handleCopyUrl} className="flex-shrink-0">
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customization Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5 text-teal-600" />
                                Customization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Size */}
                            <div className="space-y-3">
                                <Label>Size: {qrSize}px</Label>
                                <input
                                    type="range"
                                    min="200"
                                    max="600"
                                    step="50"
                                    value={qrSize}
                                    onChange={(e) => setQrSize(Number.parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Small (200px)</span>
                                    <span>Large (600px)</span>
                                </div>
                            </div>

                            {/* Color */}
                            <div className="space-y-3">
                                <Label>QR Code Color</Label>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded border cursor-pointer"
                                        style={{ backgroundColor: qrColor }}
                                        onClick={() => document.getElementById("qr-color-input")?.click()}
                                    />
                                    <Input
                                        id="qr-color-input"
                                        type="color"
                                        value={qrColor}
                                        onChange={(e) => setQrColor(e.target.value)}
                                        className="w-20"
                                    />
                                    <Button variant="outline" size="sm" onClick={() => setQrColor(restaurant.accent_color || "#0891b2")}>
                                        Use Brand Color
                                    </Button>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-medium">Include Logo</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {restaurant.logo_url
                                                ? "Add your restaurant logo to the center"
                                                : "Upload a logo in Settings to enable this option"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!restaurant.logo_url && <span className="text-xs text-amber-600 font-medium">Logo Required</span>}
                                        <Switch checked={includeLogo && !!restaurant.logo_url} onCheckedChange={handleLogoToggle} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-medium">Include Frame Text</Label>
                                        <p className="text-sm text-muted-foreground">Add descriptive text below the QR code</p>
                                    </div>
                                    <Switch checked={includeFrame} onCheckedChange={setIncludeFrame} />
                                </div>
                            </div>

                            {/* Manual Generate Button for Custom URL */}
                            {selectedTemplate.id === "custom" && (
                                <Button
                                    onClick={handleGenerateQR}
                                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                    disabled={!customUrl || isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="h-4 w-4 mr-2" />
                                            Generate QR Code
                                        </>
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Preview and Download */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>Your branded QR code preview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center space-y-6">
                                {/* QR Code Preview */}
                                <div className="relative">
                                    {isGenerating ? (
                                        <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                            <div className="text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-teal-600" />
                                                <p className="text-sm text-muted-foreground">Generating QR code...</p>
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed border-red-300 rounded-lg bg-red-50">
                                            <div className="text-center">
                                                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-red-400" />
                                                <p className="text-sm text-red-600">Failed to generate QR code</p>
                                                <p className="text-xs text-red-500 mt-1">{error}</p>
                                            </div>
                                        </div>
                                    ) : generatedQR ? (
                                        <motion.img
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            src={generatedQR}
                                            alt="Generated QR Code"
                                            className="max-w-80 h-auto border rounded-lg shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                            <div className="text-center">
                                                <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedTemplate.id === "custom"
                                                        ? "Enter a URL to generate QR code"
                                                        : "QR code will appear here"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Download Options */}
                                {generatedQR && !error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => handleDownload("png")}
                                                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PNG
                                            </Button>
                                            <Button onClick={() => handleDownload("svg")} variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download SVG
                                            </Button>
                                        </div>

                                        <Button onClick={handleCopyUrl} variant="outline" className="w-full">
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share QR Code URL
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-5 w-5 text-teal-600" />
                                Usage Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm space-y-2">
                                <p>
                                    <strong>Print Quality:</strong> Use 300px+ for print materials
                                </p>
                                <p>
                                    <strong>Table Tents:</strong> Include frame text for clarity
                                </p>
                                <p>
                                    <strong>Business Cards:</strong> Smaller sizes work better
                                </p>
                                <p>
                                    <strong>Posters:</strong> Use high contrast colors
                                </p>
                                <p>
                                    <strong>Testing:</strong> Always test QR codes before printing
                                </p>
                                <p>
                                    <strong>Logo Size:</strong> Logos are automatically sized to 20% of QR code
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
