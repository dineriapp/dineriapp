"use client"

import { GoogleRating } from "@/app/[slug]/_components/google-rating"
import { OpeningHoursStatus } from "@/app/[slug]/_components/opening-hours-status"
import SocialIcons from "@/components/social-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getLucideIconBySlug } from "@/lib/get-icons"
import { useLinks } from "@/lib/link-queries"
import { useRecentActivity, useRestaurants } from "@/lib/restaurents-queries"
import { useGoogleReviews } from "@/lib/review-api"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { GetRestaurantsResponse, OpeningHoursData } from "@/types"
import { QueryObserverResult } from "@tanstack/react-query"
import {
    BarChart2,
    Battery,
    Calendar,
    Copy,
    ExternalLink,
    HelpCircle,
    LinkIcon,
    Loader2,
    MoreVertical,
    Plus,
    QrCode,
    Settings,
    Signal,
    TrendingUp,
    Users,
    UtensilsCrossed,
    Wifi
} from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"


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


export default function DashboardPage() {
    const { restaurants, selectedRestaurant, setRestaurants, setSelectedRestaurant } = useRestaurantStore()
    const { isLoading, refetch, isFetching } = useRestaurants();
    const { data: links = [], isLoading: linksLoading, } = useLinks(selectedRestaurant?.id)
    const [monthlyVisits, setMonthlyVisits] = useState<number | null>(null);
    const { data: activityData, isLoading: activityLoading } = useRecentActivity(selectedRestaurant?.id);
    const { data: reviewData, isLoading: reviewLoading } = useGoogleReviews(selectedRestaurant?.google_place_id);

    useEffect(() => {
        const fetchMonthlyVisits = async () => {
            try {
                const res = await fetch(`/api/restaurants/${selectedRestaurant?.id}/monthly-visits`);
                const data = await res.json();
                setMonthlyVisits(data.count);
            } catch (error) {
                console.error("Failed to fetch monthly visitors:", error);
            }
        };
        if (selectedRestaurant?.id) {
            fetchMonthlyVisits();
        }
    }, [selectedRestaurant?.id]);

    useEffect(() => {
        const fetchAndSet = async () => {
            const { data }: QueryObserverResult<GetRestaurantsResponse, unknown> = await refetch();
            if (data) {
                setRestaurants(data.restaurants);

                const firstRestaurant = data.restaurants[0];
                const restaurantID = localStorage.getItem("selected-restaurant-id");

                if (!restaurantID) {
                    localStorage.setItem("selected-restaurant-id", firstRestaurant.id);
                    setSelectedRestaurant(firstRestaurant);
                } else {
                    const restaurantSelected = data.restaurants.find(res => res.id === restaurantID);
                    if (restaurantSelected) {
                        setSelectedRestaurant(restaurantSelected);
                    } else {
                        setSelectedRestaurant(firstRestaurant);
                    }
                }
            }
            if (data?.restaurants) {
                setRestaurants(data?.restaurants); // ✅ update store with new data
            }
        };

        fetchAndSet();
    }, []);

    const [currentTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

    const copyToClipboard = () => {
        if (selectedRestaurant) {
            navigator.clipboard.writeText(`https://dineri.app/${selectedRestaurant.slug}`)
            toast("URL copied to clipboard")
        }
    }

    if (restaurants.length === 0 || !selectedRestaurant || isLoading || isFetching) {
        return (
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
        )
    }

    const getBackgroundStyle = () => {
        if (selectedRestaurant?.bg_type === "image" && selectedRestaurant?.bg_image_url) {
            return {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${selectedRestaurant?.bg_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }
        }

        if (selectedRestaurant?.bg_type === "gradient" && selectedRestaurant?.bg_gradient_start && selectedRestaurant?.bg_gradient_end) {
            const directionMap: Record<string, string> = {
                top: "to top",
                bottom: "to bottom",
                left: "to left",
                right: "to right",
                "top-right": "to top right",
                "top-left": "to top left",
                "bottom-right": "to bottom right",
                "bottom-left": "to bottom left",
            }

            return {
                backgroundImage: `linear-gradient(${directionMap[selectedRestaurant?.gradient_direction] || "to bottom right"}, ${selectedRestaurant?.bg_gradient_start}, ${selectedRestaurant?.bg_gradient_end})`,
            }
        }

        return { backgroundColor: selectedRestaurant?.bg_color || "#ffffff" }
    }

    const openingHours = selectedRestaurant?.opening_hours ? (selectedRestaurant?.opening_hours as OpeningHoursData) : null

    return (
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
                            <div className="text-3xl font-bold text-slate-900">
                                {selectedRestaurant?._count?.links}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Active links on your page</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={item}>
                    <Card className="bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Menus</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
                                <UtensilsCrossed className="h-4 w-4 text-teal-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">
                                {selectedRestaurant?._count?.menuCategories}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Active menus on your page</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={item}>
                    <Card className="bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Events</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-teal-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">
                                {selectedRestaurant?._count?.events}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Active events on your page</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={item}>
                    <Card className="bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Faqs</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
                                <HelpCircle className="h-4 w-4 text-teal-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">
                                {selectedRestaurant?._count?.faqCategories}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Active faq categories on your page</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Visitors This Month</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <BarChart2 className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{monthlyVisits ?? <Loader2 className="animate-spin opacity-80" />}</div>
                            <p className="text-xs text-slate-500 mt-1">Vistors this month</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="bg-gradient-to-br from-teal-50 to-white hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Visitors</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
                                <Users className="h-4 w-4 text-teal-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{selectedRestaurant?._count?.restaurantViews}</div>
                            <p className="text-xs text-slate-500 mt-1">Total visitors all time</p>
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
                                <Link href={`/${selectedRestaurant?.slug}`} target="_blank">
                                    <Button variant="outline" size="sm" className="text-slate-700 border-slate-200">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Visit
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="mx-auto max-w-[350px] lg:max-w-[400px] p-6">
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
                                            <div className="min-h-[600px] lg:min-h-[650px] no-scroll overflow-y-auto max-h-[610px]" style={getBackgroundStyle()}>
                                                <div className="p-4 flex flex-col items-center">
                                                    {selectedRestaurant?.logo_url ? (
                                                        <motion.img
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                            src={selectedRestaurant.logo_url}
                                                            alt={selectedRestaurant.name}
                                                            className="mb-5 h-24 w-24 rounded-full object-cover"
                                                            loading="eager" />
                                                    ) : (
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                            className="mb-5 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ring-white/20 fallback-initial"
                                                            style={{ backgroundColor: selectedRestaurant?.accent_color || "blue" }}
                                                        >
                                                            <span className="text-xl font-bold text-white">{selectedRestaurant?.name.charAt(0)}</span>
                                                        </motion.div>
                                                    )}

                                                    <motion.h2
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="mb-3 text-2xl font-bold"
                                                        style={{
                                                            color: selectedRestaurant?.headings_text_color || "#000000",
                                                            fontFamily: selectedRestaurant?.font_family || "Inter",
                                                        }}
                                                    >
                                                        {selectedRestaurant?.name}
                                                    </motion.h2>

                                                    {/* Opening Hours Status */}
                                                    {openingHours && (
                                                        <motion.div
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.25 }}
                                                            className="mb-4"
                                                        >
                                                            <OpeningHoursStatus
                                                                openingHours={openingHours}
                                                                color={selectedRestaurant?.headings_text_color || "#000000"}
                                                                className="text-white cursor-pointer text-center"
                                                                accentColor={selectedRestaurant?.accent_color || "#10b981"}
                                                            />
                                                        </motion.div>
                                                    )}

                                                    {
                                                        selectedRestaurant?.google_place_id &&
                                                            reviewLoading
                                                            ?
                                                            <Skeleton className="w-[80px] h-[36px] animate-pulse" />
                                                            :
                                                            reviewData?.rating
                                                                ?
                                                                <motion.div
                                                                    initial={{ y: 20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.25 }}
                                                                    className="mb-4"
                                                                >
                                                                    <GoogleRating info={{
                                                                        rating: reviewData?.rating,
                                                                        user_ratings_total: reviewData?.user_ratings_total
                                                                    }}
                                                                        color={selectedRestaurant?.headings_text_color || "#000000"}
                                                                    />
                                                                </motion.div>
                                                                :
                                                                ""
                                                    }

                                                    {selectedRestaurant?.bio && (
                                                        <motion.p
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.3 }}
                                                            className="mx-auto mb-4 text-center max-w-md text-sm"
                                                            style={{
                                                                color: selectedRestaurant?.headings_text_color || "#000000",
                                                                opacity: 0.9,
                                                                fontFamily: selectedRestaurant?.font_family || "Inter",
                                                            }}
                                                        >
                                                            {selectedRestaurant?.bio}
                                                        </motion.p>
                                                    )}

                                                    {(selectedRestaurant?.instagram ||
                                                        selectedRestaurant?.facebook ||
                                                        selectedRestaurant?.email ||
                                                        selectedRestaurant?.address ||
                                                        selectedRestaurant?.whatsapp)
                                                        &&
                                                        <SocialIcons
                                                            restaurant={
                                                                {
                                                                    address: selectedRestaurant?.address,
                                                                    email: selectedRestaurant.email,
                                                                    facebook: selectedRestaurant.facebook,
                                                                    instagram: selectedRestaurant.facebook,
                                                                    whatsapp: selectedRestaurant.whatsapp,
                                                                }
                                                            }
                                                            className="mb-4"
                                                            theme={{
                                                                socialIconColor: selectedRestaurant.social_icon_color,
                                                                socialIconBgShow: selectedRestaurant.social_icon_bg_show,
                                                                socialIconBgColor: selectedRestaurant.social_icon_bg_color,
                                                                social_icon_gap: selectedRestaurant.social_icon_gap
                                                            }}
                                                        />
                                                    }
                                                </div>

                                                <motion.div variants={container} initial="hidden" animate="show" className="flex-grow px-4 mb-4 flex flex-col"
                                                    style={{ rowGap: `${selectedRestaurant.buttons_gap_in_px}px` }}
                                                >
                                                    {
                                                        linksLoading ?
                                                            <p className="w-full text-center text-sm">
                                                                Loading..
                                                            </p>
                                                            :
                                                            <>
                                                                {
                                                                    links?.length > 0 ?
                                                                        <>
                                                                            {links?.map((link) => (
                                                                                <div
                                                                                    key={link.id}
                                                                                    rel="noopener noreferrer"
                                                                                    className={`group flex items-center justify-center  text-center  w-full h-[52px] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${selectedRestaurant?.button_icons_show ? "px-14" : "px-4"} ${selectedRestaurant.button_style === "pill"
                                                                                        ? "rounded-full"
                                                                                        : selectedRestaurant.button_style === "square"
                                                                                            ? "rounded-md"
                                                                                            : "rounded-xl"
                                                                                        }`}
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            selectedRestaurant?.button_variant === "solid"
                                                                                                ? selectedRestaurant?.accent_color || "#10b981"
                                                                                                : "transparent",
                                                                                        backdropFilter: "blur(8px)",
                                                                                        border: `2px solid ${selectedRestaurant?.accent_color || "#10b981"}`,
                                                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                                        color: selectedRestaurant?.button_variant === "solid" ? selectedRestaurant?.button_text_icons_color || "#000000" : selectedRestaurant?.accent_color || "#10b981",
                                                                                        fontFamily: selectedRestaurant?.font_family || "Inter",
                                                                                        letterSpacing: "0.01em",
                                                                                    }}
                                                                                >

                                                                                    {
                                                                                        selectedRestaurant?.button_icons_show
                                                                                        &&
                                                                                        <div className="flex aspect-square absolute left-[7px] shrink-0 size-[38px] items-center justify-center rounded-full "
                                                                                            style={{
                                                                                                backgroundColor: selectedRestaurant.button_text_icons_color || "transparent"
                                                                                            }}
                                                                                        >
                                                                                            {getLucideIconBySlug(link.icon_slug, { className: "w-4 h-4", style: { color: selectedRestaurant.accent_color || "transparent" } })}
                                                                                        </div>
                                                                                    }
                                                                                    <span
                                                                                        className={`relative w-full text-[15px] ${selectedRestaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                                                                            } transition-colors duration-300 font-medium`}
                                                                                        style={{
                                                                                            color:
                                                                                                selectedRestaurant.button_variant === "outline" ? selectedRestaurant.accent_color || "#10b981" : selectedRestaurant.button_text_icons_color || undefined,
                                                                                        }}
                                                                                    >
                                                                                        {link.title}
                                                                                    </span>
                                                                                    {
                                                                                        selectedRestaurant?.button_icons_show
                                                                                        &&
                                                                                        <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                                                                            <MoreVertical className="size-4" />
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            ))}
                                                                        </>
                                                                        :
                                                                        <p className="w-full text-center text-sm">
                                                                            No links yet add some to see preview.
                                                                        </p>
                                                                }
                                                            </>
                                                    }

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
                                    <span className="text-sm font-medium text-slate-700">dineri.app/{selectedRestaurant?.slug}</span>
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
                                        <Link href={`/${selectedRestaurant?.slug}`} target="_blank">
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
                            <CardDescription className="text-slate-500">Latest activities of your restaurent{" "}<span className="font-bold text-black">{selectedRestaurant?.name}</span></CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="px-6 space-y-2">
                                {activityLoading && <p className="text-sm text-center text-gray-400">Loading...</p>}
                                {!activityLoading && activityData?.activity.length === 0 && (
                                    <p className="text-xs text-center text-neutral-500">You don&apos;t have any yet.</p>
                                )}
                                {!activityLoading &&
                                    activityData?.activity.map((item, i) => (
                                        <div key={i} className="text-sm text-slate-700 border-b py-1 last:border-none">
                                            {item.message}
                                            <div className="text-xs text-slate-400">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                            </div>

                        </CardContent>
                        {/* <CardFooter className="border-t border-slate-100 pt-4">
                            <Link href="/dashboard/stats" className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full justify-center border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                                    size="sm"
                                >
                                    View all activity
                                </Button>
                            </Link>
                        </CardFooter> */}
                    </Card>
                </motion.div>
            </div>
        </main>
    )
}
