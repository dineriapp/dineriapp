"use client"

import { ErrorMessage } from "@/components/error-message"
import LoadingUI from "@/components/loading-ui"
import { QRCodeItem } from "@/components/pages/dashboard/qr/qr-code-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDeleteQRCode, useQRCodes, useQRCodeStats } from "@/lib/qr-queries"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { BarChart3, Eye, Plus, QrCode } from "lucide-react"
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

    if (loading || !restaurant) {
        return (
            <LoadingUI text="Loading..." />
        )
    }

    if (qrCodesError || statsError) {
        return (
            <ErrorMessage
                title="Error loading QR codes"
                message="Please try refreshing the page."
            />
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
                                            <QRCodeItem
                                                key={qr.id}
                                                qr={{
                                                    ...qr,
                                                    typeLabel: getTypeLabel(qr.type),
                                                    typeClass: getTypeColor(qr.type),
                                                }}
                                                getScanUrl={getScanUrl}
                                                onCopy={copyScanUrl}
                                                onDownload={downloadQRCode}
                                                onDelete={handleDeleteQRCode}
                                                isDeleting={deleteQRCodeMutation.isPending}
                                            />
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
