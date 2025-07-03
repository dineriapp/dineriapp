"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Smartphone, Tablet } from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Define types
interface Restaurant {
    id: string
    user_id: string
    name: string
    slug: string
}

interface LinkStat {
    id: string
    title: string
    url: string
    view_count: number
    unique_views: number
}

// Dummy data
const dummyRestaurant: Restaurant = {
    id: "2",
    user_id: "dummy-user-2",
    name: "Bistro Delight",
    slug: "bistro-delight",
}

const dummyLinkStats: LinkStat[] = [
    {
        id: "1",
        title: "View Our Menu",
        url: "https://example.com/menu",
        view_count: 342,
        unique_views: 287,
    },
    {
        id: "2",
        title: "Make a Reservation",
        url: "https://example.com/reservation",
        view_count: 298,
        unique_views: 245,
    },
    {
        id: "3",
        title: "Follow us on Instagram",
        url: "https://instagram.com/bistrodelight",
        view_count: 156,
        unique_views: 134,
    },
    {
        id: "4",
        title: "Get Directions",
        url: "https://maps.google.com",
        view_count: 189,
        unique_views: 167,
    },
    {
        id: "5",
        title: "Order Online",
        url: "https://example.com/order",
        view_count: 267,
        unique_views: 223,
    },
]

const dummyDeviceStats = [
    { device: "Mobile", count: 687, percentage: 68.7 },
    { device: "Desktop", count: 234, percentage: 23.4 },
    { device: "Tablet", count: 79, percentage: 7.9 },
]


export default function StatsPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [linkStats, setLinkStats] = useState<LinkStat[]>([])
    const [loading, setLoading] = useState(true)
    console.log(restaurant)
    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setRestaurant(dummyRestaurant)
            setLinkStats(dummyLinkStats)
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    const totalViews = linkStats.reduce((sum, stat) => sum + stat.view_count, 0)
    const totalUniqueViews = linkStats.reduce((sum, stat) => sum + stat.unique_views, 0)

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

    return (

        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
                <p className="mt-1 text-slate-600">View statistics for your restaurant links</p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-2">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Total Views</CardTitle>
                        <CardDescription className="text-slate-500">All-time link clicks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900">{totalViews.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Unique Views</CardTitle>
                        <CardDescription className="text-slate-500">Unique link clicks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900">{totalUniqueViews.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8 border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-900">Link Performance</CardTitle>
                    <CardDescription className="text-slate-500">Views by link</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={linkStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="title"
                                    tick={{ fontSize: 12, fill: "#64748b" }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                                <Bar dataKey="view_count" fill="#0d9488" name="Total Views" />
                                <Bar dataKey="unique_views" fill="#0ea5e9" name="Unique Views" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-900">Detailed Statistics</CardTitle>
                    <CardDescription className="text-slate-500">Breakdown by link</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="px-4 py-3 text-left text-slate-700 font-medium">Link</th>
                                    <th className="px-4 py-3 text-right text-slate-700 font-medium">Total Views</th>
                                    <th className="px-4 py-3 text-right text-slate-700 font-medium">Unique Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {linkStats.map((stat) => (
                                    <tr key={stat.id} className="border-b border-slate-100">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{stat.title}</div>
                                            <div className="max-w-xs truncate text-sm text-slate-500">{stat.url}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-900">{stat.view_count}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-900">{stat.unique_views}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-slate-200 mt-8">
                <CardHeader>
                    <CardTitle className="text-slate-900">Device Breakdown</CardTitle>
                    <CardDescription className="text-slate-500">How visitors access your page</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        {dummyDeviceStats.map((device, index) => {
                            const Icon =
                                device.device === "Mobile" ? Smartphone : device.device === "Desktop" ? Monitor : Tablet
                            return (
                                <div
                                    key={index}
                                    className="text-center p-6 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white"
                                >
                                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">{device.device}</h3>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">{device.count}</div>
                                    <div className="text-sm text-slate-500">{device.percentage}% of total</div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
