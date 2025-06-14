"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "../../_components/header"

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
            <div className="min-h-screen bg-slate-50">
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

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader />

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
                            <CardDescription className="text-slate-500">Unique visitors</CardDescription>
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
            </main>
        </div>
    )
}


// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { motion } from "motion/react"
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Area,
//   AreaChart,
// } from "recharts"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   TrendingUp,
//   TrendingDown,
//   Users,
//   Eye,
//   MousePointer,
//   Calendar,
//   Globe,
//   Smartphone,
//   Monitor,
//   Tablet,
// } from "lucide-react"
// import { DashboardHeader } from "../../_components/header"

// // Define types
// interface Restaurant {
//   id: string
//   name: string
//   slug: string
// }

// interface LinkStat {
//   id: string
//   title: string
//   url: string
//   view_count: number
//   unique_views: number
//   click_rate: number
//   last_clicked: string
// }

// interface DailyStats {
//   date: string
//   views: number
//   unique_views: number
//   clicks: number
// }

// interface DeviceStats {
//   device: string
//   count: number
//   percentage: number
// }

// interface LocationStats {
//   country: string
//   views: number
//   percentage: number
// }

// // Animation variants
// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// }

// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0 },
// }

// // Dummy data
// const dummyRestaurant: Restaurant = {
//   id: "2",
//   name: "Bistro Delight",
//   slug: "bistro-delight",
// }

// const dummyLinkStats: LinkStat[] = [
//   {
//     id: "1",
//     title: "View Our Menu",
//     url: "https://example.com/menu",
//     view_count: 342,
//     unique_views: 287,
//     click_rate: 84.2,
//     last_clicked: "2024-01-15T10:30:00Z",
//   },
//   {
//     id: "2",
//     title: "Make a Reservation",
//     url: "https://example.com/reservation",
//     view_count: 298,
//     unique_views: 245,
//     click_rate: 82.2,
//     last_clicked: "2024-01-15T09:45:00Z",
//   },
//   {
//     id: "3",
//     title: "Follow us on Instagram",
//     url: "https://instagram.com/bistrodelight",
//     view_count: 156,
//     unique_views: 134,
//     click_rate: 85.9,
//     last_clicked: "2024-01-15T08:20:00Z",
//   },
//   {
//     id: "4",
//     title: "Get Directions",
//     url: "https://maps.google.com",
//     view_count: 189,
//     unique_views: 167,
//     click_rate: 88.4,
//     last_clicked: "2024-01-15T11:15:00Z",
//   },
//   {
//     id: "5",
//     title: "Order Online",
//     url: "https://example.com/order",
//     view_count: 267,
//     unique_views: 223,
//     click_rate: 83.5,
//     last_clicked: "2024-01-15T12:00:00Z",
//   },
// ]

// const dummyDailyStats: DailyStats[] = [
//   { date: "Jan 8", views: 45, unique_views: 38, clicks: 32 },
//   { date: "Jan 9", views: 52, unique_views: 44, clicks: 39 },
//   { date: "Jan 10", views: 38, unique_views: 32, clicks: 28 },
//   { date: "Jan 11", views: 61, unique_views: 51, clicks: 45 },
//   { date: "Jan 12", views: 73, unique_views: 62, clicks: 54 },
//   { date: "Jan 13", views: 89, unique_views: 74, clicks: 67 },
//   { date: "Jan 14", views: 94, unique_views: 78, clicks: 71 },
//   { date: "Jan 15", views: 102, unique_views: 85, clicks: 78 },
// ]

// const dummyDeviceStats: DeviceStats[] = [
//   { device: "Mobile", count: 687, percentage: 68.7 },
//   { device: "Desktop", count: 234, percentage: 23.4 },
//   { device: "Tablet", count: 79, percentage: 7.9 },
// ]

// const dummyLocationStats: LocationStats[] = [
//   { country: "United States", views: 456, percentage: 45.6 },
//   { country: "Canada", views: 234, percentage: 23.4 },
//   { country: "United Kingdom", views: 123, percentage: 12.3 },
//   { country: "Germany", views: 89, percentage: 8.9 },
//   { country: "France", views: 67, percentage: 6.7 },
//   { country: "Others", views: 31, percentage: 3.1 },
// ]

// const COLORS = ["#0d9488", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"]

// export default function StatsPage() {
//   const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
//   const [linkStats, setLinkStats] = useState<LinkStat[]>([])
//   const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
//   const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([])
//   const [locationStats, setLocationStats] = useState<LocationStats[]>([])
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     // Simulate loading data
//     const timer = setTimeout(() => {
//       setRestaurant(dummyRestaurant)
//       setLinkStats(dummyLinkStats)
//       setDailyStats(dummyDailyStats)
//       setDeviceStats(dummyDeviceStats)
//       setLocationStats(dummyLocationStats)
//       setLoading(false)
//     }, 1200)

//     return () => clearTimeout(timer)
//   }, [])

//   const totalViews = linkStats.reduce((sum, stat) => sum + stat.view_count, 0)
//   const totalUniqueViews = linkStats.reduce((sum, stat) => sum + stat.unique_views, 0)
//   const averageClickRate = linkStats.reduce((sum, stat) => sum + stat.click_rate, 0) / linkStats.length || 0

//   // Calculate growth percentages (simulated)
//   const viewsGrowth = 12.5
//   const uniqueViewsGrowth = 8.3
//   const clickRateGrowth = -2.1

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//         <DashboardHeader />
//         <div className="container mx-auto px-4 py-16 flex justify-center">
//           <div className="flex items-center space-x-2 text-slate-500">
//             <svg
//               className="animate-spin h-5 w-5 text-teal-600"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               ></path>
//             </svg>
//             <span>Loading analytics...</span>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       <DashboardHeader />

//       <main className="container mx-auto px-4 py-8">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
//           <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
//             Analytics
//           </h1>
//           <p className="text-slate-500 mt-2">Track your restaurant's performance and engagement metrics</p>
//         </motion.div>

//         {/* Overview Cards */}
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate="show"
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
//         >
//           <motion.div variants={item}>
//             <Card className="bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow border-slate-200">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-slate-500">Total Views</CardTitle>
//                 <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
//                   <Eye className="h-4 w-4 text-teal-600" />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-slate-900">{totalViews.toLocaleString()}</div>
//                 <div className="flex items-center mt-2">
//                   <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
//                   <span className="text-sm text-green-600 font-medium">+{viewsGrowth}%</span>
//                   <span className="text-sm text-slate-500 ml-1">vs last month</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>

//           <motion.div variants={item}>
//             <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow border-slate-200">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-slate-500">Unique Visitors</CardTitle>
//                 <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
//                   <Users className="h-4 w-4 text-blue-600" />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-slate-900">{totalUniqueViews.toLocaleString()}</div>
//                 <div className="flex items-center mt-2">
//                   <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
//                   <span className="text-sm text-green-600 font-medium">+{uniqueViewsGrowth}%</span>
//                   <span className="text-sm text-slate-500 ml-1">vs last month</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>

//           <motion.div variants={item}>
//             <Card className="bg-gradient-to-br from-teal-50 to-white hover:shadow-md transition-shadow border-slate-200">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-slate-500">Avg. Click Rate</CardTitle>
//                 <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
//                   <MousePointer className="h-4 w-4 text-teal-600" />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-slate-900">{averageClickRate.toFixed(1)}%</div>
//                 <div className="flex items-center mt-2">
//                   <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
//                   <span className="text-sm text-red-600 font-medium">{Math.abs(clickRateGrowth)}%</span>
//                   <span className="text-sm text-slate-500 ml-1">vs last month</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>

//           <motion.div variants={item}>
//             <Card className="bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow border-slate-200">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-slate-500">Active Links</CardTitle>
//                 <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
//                   <Globe className="h-4 w-4 text-slate-600" />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-slate-900">{linkStats.length}</div>
//                 <div className="flex items-center mt-2">
//                   <Calendar className="h-4 w-4 text-slate-500 mr-1" />
//                   <span className="text-sm text-slate-500">Last updated today</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </motion.div>

//         <Tabs defaultValue="overview" className="space-y-6">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="links">Link Performance</TabsTrigger>
//             <TabsTrigger value="audience">Audience</TabsTrigger>
//             <TabsTrigger value="devices">Devices</TabsTrigger>
//           </TabsList>

//           <TabsContent value="overview" className="space-y-6">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//               <Card className="border-slate-200">
//                 <CardHeader>
//                   <CardTitle className="text-slate-900">Views Over Time</CardTitle>
//                   <CardDescription className="text-slate-500">
//                     Daily views and unique visitors for the past week
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-[400px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={dailyStats}>
//                         <defs>
//                           <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
//                             <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
//                           </linearGradient>
//                           <linearGradient id="uniqueViewsGradient" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
//                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                         <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
//                         <YAxis stroke="#64748b" fontSize={12} />
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: "white",
//                             border: "1px solid #e2e8f0",
//                             borderRadius: "8px",
//                             boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//                           }}
//                         />
//                         <Area
//                           type="monotone"
//                           dataKey="views"
//                           stroke="#0d9488"
//                           strokeWidth={2}
//                           fillOpacity={1}
//                           fill="url(#viewsGradient)"
//                           name="Total Views"
//                         />
//                         <Area
//                           type="monotone"
//                           dataKey="unique_views"
//                           stroke="#0ea5e9"
//                           strokeWidth={2}
//                           fillOpacity={1}
//                           fill="url(#uniqueViewsGradient)"
//                           name="Unique Views"
//                         />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>

//           <TabsContent value="links" className="space-y-6">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//               <Card className="border-slate-200">
//                 <CardHeader>
//                   <CardTitle className="text-slate-900">Link Performance</CardTitle>
//                   <CardDescription className="text-slate-500">Views and engagement by link</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-[400px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={linkStats} margin={{ bottom: 60 }}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                         <XAxis
//                           dataKey="title"
//                           tick={{ fontSize: 12, fill: "#64748b" }}
//                           interval={0}
//                           angle={-45}
//                           textAnchor="end"
//                           height={80}
//                         />
//                         <YAxis stroke="#64748b" fontSize={12} />
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: "white",
//                             border: "1px solid #e2e8f0",
//                             borderRadius: "8px",
//                             boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//                           }}
//                         />
//                         <Bar dataKey="view_count" fill="#0d9488" name="Total Views" radius={[4, 4, 0, 0]} />
//                         <Bar dataKey="unique_views" fill="#0ea5e9" name="Unique Views" radius={[4, 4, 0, 0]} />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//               <Card className="border-slate-200">
//                 <CardHeader>
//                   <CardTitle className="text-slate-900">Detailed Statistics</CardTitle>
//                   <CardDescription className="text-slate-500">Complete breakdown by link</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="border-b border-slate-200">
//                           <th className="px-4 py-3 text-left text-slate-700 font-medium">Link</th>
//                           <th className="px-4 py-3 text-right text-slate-700 font-medium">Total Views</th>
//                           <th className="px-4 py-3 text-right text-slate-700 font-medium">Unique Views</th>
//                           <th className="px-4 py-3 text-right text-slate-700 font-medium">Click Rate</th>
//                           <th className="px-4 py-3 text-right text-slate-700 font-medium">Last Clicked</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {linkStats.map((stat, index) => (
//                           <motion.tr
//                             key={stat.id}
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: 0.1 * index }}
//                             className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
//                           >
//                             <td className="px-4 py-3">
//                               <div className="font-medium text-slate-900">{stat.title}</div>
//                               <div className="max-w-xs truncate text-sm text-slate-500">{stat.url}</div>
//                             </td>
//                             <td className="px-4 py-3 text-right font-medium text-slate-900">
//                               {stat.view_count.toLocaleString()}
//                             </td>
//                             <td className="px-4 py-3 text-right font-medium text-slate-900">
//                               {stat.unique_views.toLocaleString()}
//                             </td>
//                             <td className="px-4 py-3 text-right">
//                               <span
//                                 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                   stat.click_rate >= 85
//                                     ? "bg-green-100 text-green-800"
//                                     : stat.click_rate >= 75
//                                       ? "bg-yellow-100 text-yellow-800"
//                                       : "bg-red-100 text-red-800"
//                                 }`}
//                               >
//                                 {stat.click_rate.toFixed(1)}%
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-right text-sm text-slate-500">
//                               {new Date(stat.last_clicked).toLocaleDateString()}
//                             </td>
//                           </motion.tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>

//           <TabsContent value="audience" className="space-y-6">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//               <Card className="border-slate-200">
//                 <CardHeader>
//                   <CardTitle className="text-slate-900">Geographic Distribution</CardTitle>
//                   <CardDescription className="text-slate-500">Where your visitors are coming from</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid md:grid-cols-2 gap-8">
//                     <div className="h-[300px]">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={locationStats}
//                             cx="50%"
//                             cy="50%"
//                             outerRadius={100}
//                             fill="#8884d8"
//                             dataKey="views"
//                             label={({ country, percentage }:any) => `${country} (${percentage}%)`}
//                           >
//                             {locationStats.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>
//                     <div className="space-y-4">
//                       {locationStats.map((location, index) => (
//                         <div key={location.country} className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <div
//                               className="w-4 h-4 rounded-full"
//                               style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                             />
//                             <span className="font-medium text-slate-900">{location.country}</span>
//                           </div>
//                           <div className="text-right">
//                             <div className="font-medium text-slate-900">{location.views}</div>
//                             <div className="text-sm text-slate-500">{location.percentage}%</div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>

//           <TabsContent value="devices" className="space-y-6">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//               <Card className="border-slate-200">
//                 <CardHeader>
//                   <CardTitle className="text-slate-900">Device Breakdown</CardTitle>
//                   <CardDescription className="text-slate-500">How visitors access your page</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid md:grid-cols-3 gap-6">
//                     {deviceStats.map((device, index) => {
//                       const Icon =
//                         device.device === "Mobile" ? Smartphone : device.device === "Desktop" ? Monitor : Tablet
//                       return (
//                         <motion.div
//                           key={device.device}
//                           initial={{ opacity: 0, scale: 0.9 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           transition={{ delay: 0.1 * index }}
//                           className="text-center p-6 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white"
//                         >
//                           <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 flex items-center justify-center mb-4">
//                             <Icon className="h-6 w-6 text-teal-600" />
//                           </div>
//                           <h3 className="font-semibold text-slate-900 mb-2">{device.device}</h3>
//                           <div className="text-3xl font-bold text-slate-900 mb-1">{device.count}</div>
//                           <div className="text-sm text-slate-500">{device.percentage}% of total</div>
//                         </motion.div>
//                       )
//                     })}
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </TabsContent>
//         </Tabs>
//       </main>
//     </div>
//   )
// }
