"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Smartphone, Tablet, TrendingUp, Users, Eye, MousePointer } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useStats } from "@/lib/stats-queries"
import { Badge } from "@/components/ui/badge"
import { useRestaurantStore } from "@/stores/restaurant-store"

export default function StatsPage() {
    const { selectedRestaurant } = useRestaurantStore()
    const { data: stats, isLoading, error, dataUpdatedAt } = useStats(selectedRestaurant?.id)

    if (isLoading || !selectedRestaurant) {
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
                    <span>Loading analytics...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Unable to load analytics</h2>
                    <p className="text-slate-600">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No data available</h2>
                    <p className="text-slate-600">Start sharing your restaurant page to see analytics</p>
                </div>
            </div>
        )
    }

    const lastUpdated = new Date(dataUpdatedAt).toLocaleTimeString()

    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
                    <p className="mt-1 text-slate-600">Real-time statistics for {stats.restaurant.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-500">Last updated: {lastUpdated}</span>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Link Views</CardTitle>
                        <MousePointer className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.overview.totalViews.toLocaleString()}</div>
                        {stats.overview.recentLinkViews > 0 && (
                            <p className="text-xs text-green-600 mt-1">+{stats.overview.recentLinkViews} this week</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Unique Link Visitors</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.overview.totalUniqueViews.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stats.overview.totalViews > 0
                                ? `${Math.round((stats.overview.totalUniqueViews / stats.overview.totalViews) * 100)}% unique`
                                : "No data yet"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.overview.totalPageViews.toLocaleString()}</div>
                        {stats.overview.recentPageViews > 0 && (
                            <p className="text-xs text-green-600 mt-1">+{stats.overview.recentPageViews} this week</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Unique Page Visitors</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.overview.uniquePageViews.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stats.overview.totalPageViews > 0
                                ? `${Math.round((stats.overview.uniquePageViews / stats.overview.totalPageViews) * 100)}% unique`
                                : "No data yet"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Link Performance Chart */}
            {stats.linkStats.length > 0 ? (
                <Card className="mb-8 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Link Performance</CardTitle>
                        <CardDescription className="text-slate-500">Clicks on link</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.linkStats}>
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
                                    <Bar dataKey="view_count" fill="#0d9488" name="Total Clicks" />
                                    <Bar dataKey="unique_views" fill="#0ea5e9" name="Unique Clicks" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="mb-8 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Link Performance</CardTitle>
                        <CardDescription className="text-slate-500">No links created yet</CardDescription>
                    </CardHeader>
                    <CardContent className="py-8">
                        <div className="text-center text-slate-500">
                            <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Create some links to see performance analytics</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Detailed Statistics Table */}
            {stats.linkStats.length > 0 && (
                <Card className="mb-8 border-slate-200 shadow-sm">
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
                                        <th className="px-4 py-3 text-right text-slate-700 font-medium">Total Clicks</th>
                                        <th className="px-4 py-3 text-right text-slate-700 font-medium">Unique Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.linkStats.map((stat) => (
                                        <tr key={stat.id} className="border-b border-slate-100">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{stat.title}</div>
                                                <div className="max-w-xs truncate text-sm text-slate-500">{stat.url}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Badge variant="secondary" className="font-medium">
                                                    {stat.view_count}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Badge variant="outline" className="font-medium">
                                                    {stat.unique_views}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Device Breakdown */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-slate-900">Device Breakdown</CardTitle>
                    <CardDescription className="text-slate-500">How visitors access your page</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.deviceStats.some((device) => device.count > 0) ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {stats.deviceStats.map((device, index) => {
                                const Icon = device.device === "Mobile" ? Smartphone : device.device === "Desktop" ? Monitor : Tablet
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
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No device data available yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
