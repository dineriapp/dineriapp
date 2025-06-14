"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { QrCode, BarChart3, Download, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import type { Restaurant } from "@/lib/types"
import { QRCodeGenerator } from "@/lib/qr-generator"
import { QRCodeGeneratorComponent } from "../../_components/qr-code-generator"
import { DashboardHeader } from "../../_components/header"

interface QRCode {
    id: string
    name: string
    type: "restaurant_page" | "menu" | "events" | "review" | "social" | "custom"
    url: string
    customFrameText?: string
    size: number
    color: string
    includeLogo: boolean
    includeFrame: boolean
    frameText: string
    qrDataUrl: string
    scans: number
    downloads: number
    createdAt: string
    lastScanned?: string
    isActive: boolean
}

// Dummy restaurant data
const DUMMY_RESTAURANT: any = {
    id: "1",
    name: "Bella Vista Restaurant",
    slug: "bella-vista",
    logo_url: "/placeholder.svg?height=100&width=100&text=Logo",
    accent_color: "#0891b2",
    instagram: "https://instagram.com/bellavista",
    website: "https://bellavista.com",
    phone: "+1 (555) 123-4567",
    email: "info@bellavista.com",
}

// Initial QR stats data
const INITIAL_QR_STATS: QRCodeStat[] = [
    {
        id: "1",
        type: "menu",
        url: "https://dineri.app/bella-vista",
        scans: 247,
        created_at: "2024-01-15T10:30:00Z",
    },
    {
        id: "2",
        type: "review",
        url: "https://dineri.app/review/bella-vista",
        scans: 89,
        created_at: "2024-01-10T09:15:00Z",
    },
    {
        id: "3",
        type: "social",
        url: "https://instagram.com/bellavista",
        scans: 156,
        created_at: "2024-01-08T11:20:00Z",
    },
]

interface QRCodeStat {
    id: string
    type: string
    url: string
    scans: number
    created_at: string
}

const generateQRCodeDataUrl = async (
    url: string,
    options: {
        size: number
        color: string
        includeLogo: boolean
        includeFrame: boolean
        frameText: string
    },
): Promise<string> => {
    try {
        return await QRCodeGenerator.generateBrandedQRCode(url, {
            size: options.size,
            accentColor: options.color,
            logoUrl: options.includeLogo ? DUMMY_RESTAURANT.logo_url : undefined,
            includeFrame: options.includeFrame,
            frameText: options.includeFrame ? options.frameText : undefined,
            restaurantName: DUMMY_RESTAURANT.name,
        })
    } catch (error) {
        console.error("Error generating QR code:", error)
        // Fallback to placeholder if generation fails
        const params = new URLSearchParams({
            height: options.size.toString(),
            width: options.size.toString(),
            text: `QR:${url}`,
            bg: "ffffff",
            color: options.color.replace("#", ""),
        })
        return `/placeholder.svg?${params.toString()}`
    }
}

export default function QRCodesPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [qrCodes, setQrCodes] = useState<QRCode[]>([])
    const [qrStats, setQrStats] = useState<QRCodeStat[]>([])
    const [loading, setLoading] = useState(true)

    const generateQRUrl = (type: QRCode["type"]) => {
        switch (type) {
            case "restaurant_page":
                return "https://dineri.app/bella-vista"
            case "menu":
                return "https://dineri.app/bella-vista#menu"
            case "events":
                return "https://dineri.app/events/bella-vista"
            case "review":
                return "https://dineri.app/review/bella-vista"
            case "social":
                return "https://instagram.com/bellavista"
            default:
                return "https://dineri.app/bella-vista"
        }
    }

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)

                // Simulate loading delay
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Set dummy data
                setRestaurant(DUMMY_RESTAURANT)

                const dummyQRCodes: QRCode[] = await Promise.all([
                    {
                        id: "1",
                        name: "Main Restaurant Page",
                        type: "restaurant_page",
                        url: generateQRUrl("restaurant_page"),
                        size: 300,
                        color: "#0891b2",
                        includeLogo: true,
                        includeFrame: true,
                        frameText: "Scan for Menu & More",
                        qrDataUrl: await generateQRCodeDataUrl(generateQRUrl("restaurant_page"), {
                            size: 300,
                            color: "#0891b2",
                            includeLogo: true,
                            includeFrame: true,
                            frameText: "Scan for Menu & More",
                        }),
                        scans: 247,
                        downloads: 12,
                        createdAt: "2024-01-15T10:30:00Z",
                        lastScanned: "2024-01-20T14:22:00Z",
                        isActive: true,
                    },
                    {
                        id: "2",
                        name: "Digital Menu",
                        type: "menu",
                        url: generateQRUrl("menu"),
                        size: 250,
                        color: "#059669",
                        includeLogo: false,
                        includeFrame: true,
                        frameText: "Scan for Menu",
                        qrDataUrl: await generateQRCodeDataUrl(generateQRUrl("menu"), {
                            size: 250,
                            color: "#059669",
                            includeLogo: false,
                            includeFrame: true,
                            frameText: "Scan for Menu",
                        }),
                        scans: 189,
                        downloads: 8,
                        createdAt: "2024-01-10T09:15:00Z",
                        lastScanned: "2024-01-20T16:45:00Z",
                        isActive: true,
                    },
                    {
                        id: "3",
                        name: "Instagram Follow",
                        type: "social",
                        url: generateQRUrl("social"),
                        size: 200,
                        color: "#dc2626",
                        includeLogo: true,
                        includeFrame: true,
                        frameText: "Follow Us on Instagram",
                        qrDataUrl: await generateQRCodeDataUrl(generateQRUrl("social"), {
                            size: 200,
                            color: "#dc2626",
                            includeLogo: true,
                            includeFrame: true,
                            frameText: "Follow Us on Instagram",
                        }),
                        scans: 156,
                        downloads: 5,
                        createdAt: "2024-01-08T11:20:00Z",
                        lastScanned: "2024-01-19T13:30:00Z",
                        isActive: true,
                    },
                    {
                        id: "4",
                        name: "Customer Reviews",
                        type: "review",
                        url: generateQRUrl("review"),
                        size: 300,
                        color: "#7c3aed",
                        includeLogo: false,
                        includeFrame: true,
                        frameText: "Scan to Leave Review",
                        qrDataUrl: await generateQRCodeDataUrl(generateQRUrl("review"), {
                            size: 300,
                            color: "#7c3aed",
                            includeLogo: false,
                            includeFrame: true,
                            frameText: "Scan to Leave Review",
                        }),
                        scans: 94,
                        downloads: 3,
                        createdAt: "2024-01-05T15:45:00Z",
                        lastScanned: "2024-01-18T10:15:00Z",
                        isActive: false,
                    },
                ])

                setQrCodes(dummyQRCodes)
                setQrStats(INITIAL_QR_STATS)
            } catch (error) {
                console.error("Error loading data:", error)
                toast.error("Failed to load QR code data. Please try refreshing the page.")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Calculate stats from QR data
    const totalQRCodes = qrCodes.length
    const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scans, 0)
    const totalDownloads = Math.floor(totalScans * 0.15) // Simulate downloads as 15% of scans

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <DashboardHeader />
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
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <DashboardHeader />
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
                        <span>Restaurant not found</span>
                    </div>
                </div>
            </div>

        )
    }

    return (
        <div className="min-h-screen  bg-gradient-to-b from-slate-50 to-white">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                        QR Codes
                    </h1>
                    <p className="mt-2 text-muted-foreground">Generate branded QR codes for your restaurant</p>
                </motion.div>

                <Tabs defaultValue="generator" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 h-[44px]">
                        <TabsTrigger value="generator" className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            Generator
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generator">
                        <QRCodeGeneratorComponent restaurant={restaurant} />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <div className="space-y-6">
                            {/* Stats Overview */}
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Codes</CardTitle>
                                        <QrCode className="h-4 w-4 text-teal-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-teal-700">{totalQRCodes}</div>
                                        <p className="mt-1 text-xs text-muted-foreground">Generated this month</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
                                        <Eye className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-700">{totalScans}</div>
                                        <p className="mt-1 text-xs text-muted-foreground">Scans this month</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Downloads</CardTitle>
                                        <Download className="h-4 w-4 text-purple-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-purple-700">{totalDownloads}</div>
                                        <p className="mt-1 text-xs text-muted-foreground">Downloads this month</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* QR Code History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>QR Code History</CardTitle>
                                    <CardDescription>Track your generated QR codes and their performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {qrStats.length > 0 ? (
                                        <div className="space-y-4">
                                            {qrStats.map((qr) => (
                                                <div
                                                    key={qr.id}
                                                    className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-blue-100">
                                                            <QrCode className="h-5 w-5 text-teal-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium capitalize">{qr.type} QR Code</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Created {new Date(qr.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{qr.scans} scans</p>
                                                        <p className="text-sm text-muted-foreground">{Math.floor(qr.scans * 0.15)} downloads</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <QrCode className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-semibold">No QR codes yet</h3>
                                            <p className="mb-4 text-muted-foreground">
                                                Generate your first QR code to start tracking analytics
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
