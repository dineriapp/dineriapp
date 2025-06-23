"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
    Plus,
    ExternalLink,
    Settings,
    Instagram,
    Calendar,
    MapPin,
    MenuIcon,
    Signal,
    Battery,
    Wifi,
    BarChart2,
    Users,
    LinkIcon,
    Facebook,
    Copy,
    QrCode,
    TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { DashboardHeader } from "../../_components/header"

// Define types
interface Restaurant {
    id: string
    user_id: string
    name: string
    bio: string
    logo_url: string | null
    bg_color: string
    accent_color: string
    bg_type: string
    bg_gradient_start: string
    bg_gradient_end: string
    button_style: string
    button_variant: string
    font_family: string
    slug: string
    created_at: string
    subscription_plan: string
    subscription_status: string
    instagram?: string
    facebook?: string
}

interface RestaurantLink {
    id: string
    restaurant_id: string
    title: string
    url: string
    sort_order: number
    clicks: number
    created_at: string
}

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

// Dummy data
const dummyRestaurant: Restaurant = {
    id: "2",
    user_id: "dummy-user-2",
    name: "Bistro Delight",
    bio: "Casual and cozy bistro serving fresh, locally-sourced ingredients with a modern twist on classic favorites.",
    logo_url: null,
    bg_color: "#ffffff",
    accent_color: "#0ea5e9",
    bg_type: "gradient",
    bg_gradient_start: "#f8fafc",
    bg_gradient_end: "#f1f5f9",
    button_style: "rounded",
    button_variant: "solid",
    font_family: "Inter",
    slug: "bistro-delight",
    created_at: new Date().toISOString(),
    subscription_plan: "free",
    subscription_status: "active",
    instagram: "https://instagram.com/bistrodelight",
    facebook: "https://facebook.com/bistrodelight",
}

const dummyLinks: RestaurantLink[] = [
    {
        id: "1",
        restaurant_id: "2",
        title: "View Our Menu",
        url: "https://example.com/menu",
        sort_order: 1,
        clicks: 42,
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        restaurant_id: "2",
        title: "Make a Reservation",
        url: "https://example.com/reservation",
        sort_order: 2,
        clicks: 28,
        created_at: new Date().toISOString(),
    },
    {
        id: "3",
        restaurant_id: "2",
        title: "Follow us on Instagram",
        url: "https://instagram.com/bistrodelight",
        sort_order: 3,
        clicks: 15,
        created_at: new Date().toISOString(),
    },
    {
        id: "4",
        restaurant_id: "2",
        title: "Get Directions",
        url: "https://maps.google.com",
        sort_order: 4,
        clicks: 19,
        created_at: new Date().toISOString(),
    },
]

export default function DashboardPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [links, setLinks] = useState<RestaurantLink[]>([])
    const [loading, setLoading] = useState(true)
    const [currentTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setRestaurant(dummyRestaurant)
            setLinks(dummyLinks)
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    const getIconForLink = (title: string) => {
        const lowerTitle = title.toLowerCase()

        if (lowerTitle.includes("instagram") || lowerTitle.includes("follow")) return <Instagram className="h-4 w-4" />
        if (lowerTitle.includes("reservation") || lowerTitle.includes("book")) return <Calendar className="h-4 w-4" />
        if (lowerTitle.includes("direction") || lowerTitle.includes("location")) return <MapPin className="h-4 w-4" />
        if (lowerTitle.includes("menu")) return <MenuIcon className="h-4 w-4" />

        return <ExternalLink className="h-4 w-4" />
    }

    const copyToClipboard = () => {
        if (restaurant) {
            navigator.clipboard.writeText(`https://dineri.app/${restaurant.slug}`)
            toast("URL copied to clipboard")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <DashboardHeader />
                <div className="max-w-[1200px] mx-auto px-4 py-16 flex justify-center">
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
                        <span>Loading your dashboard...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 mt-2">Manage your restaurant profile and track performance</p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Total Links</CardTitle>
                                <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
                                    <LinkIcon className="h-4 w-4 text-teal-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{links.length}</div>
                                <p className="text-xs text-slate-500 mt-1">Active links on your page</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Total Views</CardTitle>
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                    <BarChart2 className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">104</div>
                                <p className="text-xs text-slate-500 mt-1">Link clicks this month</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br from-teal-50 to-white hover:shadow-md transition-shadow border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Unique Visitors</CardTitle>
                                <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-teal-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">78</div>
                                <p className="text-xs text-slate-500 mt-1">Unique visitors this month</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <Card className="overflow-hidden border-slate-200">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-slate-900">Preview</CardTitle>
                                        <CardDescription className="text-slate-500">
                                            See how your page looks on mobile devices
                                        </CardDescription>
                                    </div>
                                    <Link href={`/${restaurant?.slug}`} target="_blank">
                                        <Button variant="outline" size="sm" className="text-slate-700 border-slate-200">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Visit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="mx-auto max-w-[300px] p-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-teal-500/20 to-blue-500/20 blur-xl opacity-30 scale-105 translate-y-2"></div>

                                        <div className="relative rounded-[2rem] bg-black overflow-hidden shadow-[0_0_0_12px_rgba(0,0,0,0.8)]">
                                            <div className="absolute -right-[2px] top-16 w-[3px] h-12 bg-gray-800 rounded-l-lg"></div>
                                            <div className="absolute -left-[2px] top-20 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>
                                            <div className="absolute -left-[2px] top-28 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>

                                            <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                                                <div className="w-[84px] h-[32px] bg-black rounded-b-[18px] flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] ring-[3px] ring-[#121212] absolute left-4"></div>
                                                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a] absolute right-4"></div>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex items-center justify-between text-white px-4 pt-2 text-[12px] font-medium">
                                                <span>{currentTime}</span>
                                                <div className="flex items-center gap-1">
                                                    <Signal className="h-3 w-3" />
                                                    <Wifi className="h-3 w-3" />
                                                    <Battery className="h-3 w-3" />
                                                </div>
                                            </div>

                                            <div className="mt-1">
                                                <div
                                                    className="min-h-[480px]"
                                                    style={{
                                                        background:
                                                            restaurant?.bg_type === "gradient" &&
                                                                restaurant?.bg_gradient_start &&
                                                                restaurant?.bg_gradient_end
                                                                ? `linear-gradient(to bottom right, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`
                                                                : restaurant?.bg_color || "#ffffff",
                                                    }}
                                                >
                                                    <div className="p-4 flex flex-col items-center">
                                                        {restaurant?.logo_url ? (
                                                            <motion.img
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                                src={restaurant.logo_url}
                                                                alt={restaurant.name}
                                                                className="w-16 h-16 rounded-full object-cover mb-3 shadow-lg ring-4 ring-black/10"
                                                            />
                                                        ) : (
                                                            <motion.div
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                                className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ring-4 ring-black/10"
                                                                style={{
                                                                    background: `linear-gradient(to right, #0ea5e9, #0284c7)`,
                                                                }}
                                                            >
                                                                <span className="text-xl font-bold text-white">{restaurant?.name.charAt(0)}</span>
                                                            </motion.div>
                                                        )}

                                                        <motion.h2
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="text-lg font-bold mb-1"
                                                            style={{
                                                                color: restaurant?.bg_color === "#ffffff" ? "#000000" : "#ffffff",
                                                            }}
                                                        >
                                                            {restaurant?.name}
                                                        </motion.h2>

                                                        {restaurant?.bio && (
                                                            <motion.p
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{ delay: 0.3 }}
                                                                className="text-xs opacity-90 text-center"
                                                                style={{
                                                                    color:
                                                                        restaurant?.bg_color === "#ffffff" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)",
                                                                }}
                                                            >
                                                                {restaurant.bio}
                                                            </motion.p>
                                                        )}

                                                        {(restaurant?.instagram || restaurant?.facebook) && (
                                                            <motion.div
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{ delay: 0.4 }}
                                                                className="flex items-center justify-center gap-4 mb-6 mt-4"
                                                            >
                                                                {restaurant.instagram && (
                                                                    <a
                                                                        href={restaurant.instagram}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
                                                                        style={{ color: "#0ea5e9" }}
                                                                    >
                                                                        <Instagram className="h-5 w-5" />
                                                                    </a>
                                                                )}
                                                                {restaurant.facebook && (
                                                                    <a
                                                                        href={restaurant.facebook}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
                                                                        style={{ color: "#0ea5e9" }}
                                                                    >
                                                                        <Facebook className="h-5 w-5" />
                                                                    </a>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    <motion.div variants={container} initial="hidden" animate="show" className="px-3 space-y-2">
                                                        {links.length > 0 ? (
                                                            links.map((link) => (
                                                                <motion.div
                                                                    key={link.id}
                                                                    variants={item}
                                                                    className="flex items-center gap-2 p-3 w-full transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                                                                    style={{
                                                                        border: `1px solid rgba(14, 165, 233, 0.3)`,
                                                                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                                        backdropFilter: "blur(8px)",
                                                                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                                                                    }}
                                                                >
                                                                    <span style={{ color: "#0ea5e9" }}>{getIconForLink(link.title)}</span>
                                                                    <span className="font-medium text-xs">{link.title}</span>
                                                                </motion.div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6">
                                                                <p className="text-slate-500 text-xs">No links added yet</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </div>

                                                <div className="absolute bottom-1 inset-x-0 flex justify-center pb-1">
                                                    <div className="w-[100px] h-1 bg-white/30 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <Card className="hover:shadow-md transition-shadow border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">Quick Actions</CardTitle>
                                <CardDescription className="text-slate-500">Common tasks and settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4">
                                    <Link href="/dashboard/links">
                                        <Button className="w-full justify-start bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-[1.02] transition-all group">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add new link
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/settings">
                                        <Button
                                            className="w-full justify-start hover:scale-[1.02] transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                                            variant="outline"
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Edit profile
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/qr-codes">
                                        <Button
                                            className="w-full justify-start hover:scale-[1.02] transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                                            variant="outline"
                                        >
                                            <QrCode className="h-4 w-4 mr-2" />
                                            Generate QR code
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/stats">
                                        <Button
                                            className="w-full justify-start hover:scale-[1.02] transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                                            variant="outline"
                                        >
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            View analytics
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow backdrop-blur-sm bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">Your Restaurant Page</CardTitle>
                                <CardDescription className="text-slate-500">Share your page with customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">dineri.app/{restaurant?.slug}</span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-slate-600 hover:text-teal-600 hover:bg-teal-50"
                                                onClick={copyToClipboard}
                                            >
                                                <Copy className="h-4 w-4" />
                                                <span className="sr-only">Copy URL</span>
                                            </Button>
                                            <Link href={`/${restaurant?.slug}`} target="_blank">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-teal-600 hover:bg-teal-50"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    <span className="sr-only">Visit page</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                                <p className="text-xs text-slate-500 mt-4">
                                    This is your unique page URL. Share it with your customers to help them find all your important links
                                    in one place.
                                </p>
                            </CardContent>
                            <CardFooter className="border-t border-slate-100 pt-4">
                                <Button
                                    className="w-full justify-center bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                    size="sm"
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Generate QR Code
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-slate-900">Recent Activity</CardTitle>
                                <CardDescription className="text-slate-500">Latest clicks on your links</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="px-6">
                                    {links.slice(0, 3).map((link, index) => (
                                        <div
                                            key={link.id}
                                            className={`py-3 flex items-center justify-between ${index < links.slice(0, 3).length - 1 ? "border-b border-slate-100" : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                                    {getIconForLink(link.title)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{link.title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {Math.floor(Math.random() * 24) + 1} hours ago • {link.clicks} clicks
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-teal-600">+{Math.floor(Math.random() * 5) + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-slate-100 pt-4">
                                <Link href="/dashboard/stats" className="w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-center border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                                        size="sm"
                                    >
                                        View all activity
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
