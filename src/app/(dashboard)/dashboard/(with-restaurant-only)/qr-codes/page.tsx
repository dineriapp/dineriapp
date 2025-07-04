"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useQRCodes, useQRCodeStats, useDeleteQRCode } from "@/lib/qr-queries"
import { BarChart3, Download, Eye, QrCode, Plus, Trash2, ExternalLink, Copy } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"
import { QRCodeGeneratorComponent } from "./qr-code-generator"

export default function QRCodesPage() {
    const { selectedRestaurant: restaurant } = useRestaurantStore()
    const [activeTab, setActiveTab] = useState("analytics")

    const { data: qrCodes = [], isLoading: qrCodesLoading, error: qrCodesError } = useQRCodes(restaurant?.id || "")

    const { data: stats, isLoading: statsLoading, error: statsError } = useQRCodeStats(restaurant?.id || "")

    const deleteQRCodeMutation = useDeleteQRCode(restaurant?.id || "")

    const handleDeleteQRCode = async (id: string) => {
        if (!confirm("Are you sure you want to delete this QR code?")) return

        try {
            await deleteQRCodeMutation.mutateAsync(id)
        } catch {
            // Error handling is done in the mutation
        }
    }

    const getScanUrl = (qrCodeId: string) => {
        return `${window.location.origin}/api/qr-codes/scan/${qrCodeId}`
    }

    const copyScanUrl = (qrCodeId: string) => {
        const url = getScanUrl(qrCodeId)
        navigator.clipboard.writeText(url)
        toast.success("Scan URL copied to clipboard!")
    }

    const downloadQRCode = (qrCode: any) => {
        if (!qrCode.qr_data_url) {
            toast.error("QR code image not available")
            return
        }

        // Create download link
        const link = document.createElement("a")
        link.download = `${qrCode.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
        link.href = qrCode.qr_data_url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("QR code downloaded!")
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "restaurant_page":
                return "Restaurant Page"
            case "link":
                return "Link"
            case "custom":
                return "Custom URL"
            default:
                return type
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case "restaurant_page":
                return "bg-blue-100 text-blue-800"
            case "link":
                return "bg-green-100 text-green-800"
            case "custom":
                return "bg-purple-100 text-purple-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const loading = qrCodesLoading || statsLoading

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
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
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    if (qrCodesError || statsError) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Error loading QR codes</h2>
                    <p className="text-gray-600">Please try refreshing the page.</p>
                </div>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Restaurant not found</h2>
                    <p className="text-gray-600">Please select a restaurant to manage QR codes.</p>
                </div>
            </div>
        )
    }

    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                    QR Codes
                </h1>
                <p className="mt-2 text-muted-foreground">Generate and manage branded QR codes for your restaurant</p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 h-[44px]">
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="generator" className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        Generator
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                    <div className="space-y-6">
                        {/* Stats Overview */}
                        {stats && (
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Codes</CardTitle>
                                        <QrCode className="h-4 w-4 text-teal-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-teal-700">{stats.totalQRCodes}</div>
                                        <p className="mt-1 text-xs text-muted-foreground">{stats.activeQRCodes} active</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
                                        <Eye className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-700">{stats.totalScans}</div>
                                        <p className="mt-1 text-xs text-muted-foreground">All time</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Scans</CardTitle>
                                        <BarChart3 className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-700">
                                            {stats.totalQRCodes > 0 ? Math.round(stats.totalScans / stats.totalQRCodes) : 0}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">Per QR code</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* QR Code List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your QR Codes</CardTitle>
                                <CardDescription>Manage and track your generated QR codes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {qrCodes.length > 0 ? (
                                    <div className="space-y-4">
                                        {qrCodes.map((qr) => (
                                            <div
                                                key={qr.id}
                                                className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-blue-100">
                                                        <QrCode className="h-6 w-6 text-teal-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-medium">{qr.name}</h3>
                                                            <Badge className={getTypeColor(qr.type)}>{getTypeLabel(qr.type)}</Badge>
                                                            {!qr.is_active && <Badge variant="secondary">Inactive</Badge>}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Created {new Date(qr.created_at).toLocaleDateString()}
                                                            {qr.last_scanned_at && (
                                                                <span> • Last scanned {new Date(qr.last_scanned_at).toLocaleDateString()}</span>
                                                            )}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs text-muted-foreground">Scan URL:</p>
                                                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                                                {getScanUrl(qr.id).substring(0, 50)}...
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyScanUrl(qr.id)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-medium">{qr.scan_count} scans</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {qr.scan_count === 0 ? "Never scanned" : "Active"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => window.open(qr.target_url, "_blank")}>
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                        {qr.qr_data_url && (
                                                            <Button variant="outline" size="sm" onClick={() => downloadQRCode(qr)}>
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteQRCode(qr.id)}
                                                            disabled={deleteQRCodeMutation.isPending}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <QrCode className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-semibold">No QR codes yet</h3>
                                        <p className="mb-4 text-muted-foreground">Generate your first QR code to start tracking scans</p>
                                        <Button onClick={() => setActiveTab("generator")}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create QR Code
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="generator">
                    <QRCodeGeneratorComponent restaurant={restaurant} />
                </TabsContent>
            </Tabs>
        </main>
    )
}
