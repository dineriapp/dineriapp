"use client"

import { ErrorMessage } from "@/components/error-message"
import LoadingUI from "@/components/loading-ui"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStats } from "@/lib/stats-queries"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { Eye, Monitor, MousePointer, Smartphone, Tablet, TrendingUp, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function StatsPage() {
    const { selectedRestaurant } = useRestaurantStore()
    const { data: stats, isLoading, error, dataUpdatedAt } = useStats(selectedRestaurant?.id)

    if (isLoading || !selectedRestaurant) {
        return (
            <LoadingUI text="Loading analytics..." />
        )
    }

    if (error) {
        return (
            <ErrorMessage
                title="Unable to load analytics"
                message="Please try refreshing the page"
            />
        )
    }

    if (!stats) {
        return (
            <ErrorMessage
                title="No data available"
                message="Start sharing your restaurant page to see analytics"
            />
        )
    }

    const lastUpdated = new Date(dataUpdatedAt).toLocaleTimeString()


    const overviewCards = [
        {
            title: "Total Link Views",
            value: stats.overview.totalViews,
            icon: <MousePointer className="h-4 w-4 text-main-blue" />,
            extra: stats.overview.recentLinkViews > 0
                ? `+${stats.overview.recentLinkViews} this week`
                : null,
            extraClass: "text-green-600",
        },
        {
            title: "Unique Link Visitors",
            value: stats.overview.totalUniqueViews,
            icon: <Users className="h-4 w-4 text-main-blue" />,
            extra:
                stats.overview.totalViews > 0
                    ? `${Math.round((stats.overview.totalUniqueViews / stats.overview.totalViews) * 100)}% unique`
                    : "No data yet",
            extraClass: "text-gray-500",
        },
        {
            title: "Page Views",
            value: stats.overview.totalPageViews,
            icon: <Eye className="h-4 w-4 text-main-blue" />,
            extra: stats.overview.recentPageViews > 0
                ? `+${stats.overview.recentPageViews} this week`
                : null,
            extraClass: "text-green-600",
        },
        {
            title: "Unique Page Visitors",
            value: stats.overview.uniquePageViews,
            icon: <TrendingUp className="h-4 w-4 text-main-blue" />,
            extra:
                stats.overview.totalPageViews > 0
                    ? `${Math.round((stats.overview.uniquePageViews / stats.overview.totalPageViews) * 100)}% unique`
                    : "No data yet",
            extraClass: "text-gray-500",
        },
    ];

    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#002147]">Analytics</h1>
                    <p className="mt-1 text-gray-600">Real-time statistics for {stats.restaurant.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-[#009a5e] rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {overviewCards.map((card, idx) => (
                    <Card key={idx} className="border-gray-200 shadow-sm box-shad-every">
                        <CardHeader className="flex flex-row items-center font-poppins justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {card.title}
                            </CardTitle>
                            {card.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {card.value.toLocaleString()}
                            </div>
                            {card.extra && (
                                <p className={`text-xs mt-1 ${card.extraClass}`}>
                                    {card.extra}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Link Performance Chart */}
            {stats.linkStats.length > 0 ? (
                <Card className="mb-8 border-gray-200 shadow-sm">
                    <CardHeader className="font-poppins">
                        <CardTitle className="text-gray-900">Link Performance</CardTitle>
                        <CardDescription className="text-gray-500">Clicks on link</CardDescription>
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
                <Card className="mb-8 border-gray-200 shadow-sm">
                    <CardHeader className="font-poppins">
                        <CardTitle className="text-gray-900">Link Performance</CardTitle>
                        <CardDescription className="text-gray-500">No links created yet</CardDescription>
                    </CardHeader>
                    <CardContent className="py-8">
                        <div className="text-center text-gray-500">
                            <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Create some links to see performance analytics</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Detailed Statistics Table */}
            {stats.linkStats.length > 0 && (
                <Card className="mb-8 border-gray-200 shadow-sm">
                    <CardHeader className="font-poppins">
                        <CardTitle className="text-gray-900">Detailed Statistics</CardTitle>
                        <CardDescription className="text-gray-500">Breakdown by link</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-gray-700 font-medium ">Link</th>
                                        <th className="px-4 py-3 text-right text-gray-700 font-medium">Total Clicks</th>
                                        <th className="px-4 py-3 text-right text-gray-700 font-medium">Unique Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.linkStats.map((stat) => (
                                        <tr key={stat.id} className="border-b border-gray-100">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{stat.title}</div>
                                                <div className="max-w-xs truncate text-sm text-gray-500">{stat.url}</div>
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
            <Card className="border-gray-200">
                <CardHeader className="font-poppins">
                    <CardTitle className="text-gray-900">Device Breakdown</CardTitle>
                    <CardDescription className="text-gray-500">How visitors access your page</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.deviceStats.some((device) => device.count > 0) ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {stats.deviceStats.map((device, index) => {
                                const Icon = device.device === "Mobile" ? Smartphone : device.device === "Desktop" ? Monitor : Tablet
                                return (
                                    <div
                                        key={index}
                                        className="text-center p-6 rounded-lg border border-gray-200 box-shad-every bg-gradient-to-br from-gray-100 to-white"
                                    >
                                        <div className="mx-auto w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                            <Icon className="h-6 w-6 text-main-green" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{device.device}</h3>
                                        <div className="text-3xl font-bold text-gray-900 mb-1">{device.count}</div>
                                        <div className="text-sm text-gray-500">{device.percentage}% of total</div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No device data available yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
