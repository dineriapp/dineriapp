"use client"

import LoadingUI from "@/components/loading-ui"
import QuickActions from "@/components/pages/dashboard/quick-actions"
import RecentActivity from "@/components/pages/dashboard/recent-activity"
import Share from "@/components/pages/dashboard/share"
import SlugPagePreview from "@/components/shared/slug-page-preview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMonthlyVisits } from "@/hooks/useMonthlyVisits"
import { useSyncRestaurants } from "@/hooks/useSyncRestaurants"
import { useRecentActivity, useRestaurants } from "@/lib/restaurents-queries"
import { container, motionItem } from "@/lib/reuseable-data"
import { useRestaurantStore } from "@/stores/restaurant-store"
import {
    BarChart2,
    Calendar,
    HelpCircle,
    LinkIcon,
    Loader2,
    Users,
    UtensilsCrossed
} from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

export default function DashboardPage() {
    const { restaurants, selectedRestaurant } = useRestaurantStore()
    const { isLoading, isFetching } = useRestaurants();
    const { data: activityData, isLoading: activityLoading } = useRecentActivity(selectedRestaurant?.id);
    const { fetchAndSet } = useSyncRestaurants();
    const { monthlyVisits } = useMonthlyVisits(selectedRestaurant?.id);
    const t = useTranslations("dashboard")

    useEffect(() => {
        fetchAndSet();
    }, [fetchAndSet]);

    if (restaurants.length === 0 || !selectedRestaurant || isLoading || isFetching) {
        return (
            <LoadingUI text={t("loadingText")} />
        )
    }

    const stats = [
        {
            title: t("stats.totalLinks.title"),
            count: selectedRestaurant?._count?.links,
            icon: <LinkIcon className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: t("stats.totalLinks.description"),
        },
        {
            title: t("stats.totalMenus.title"),
            count: selectedRestaurant?._count?.menuCategories,
            icon: <UtensilsCrossed className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: t("stats.totalMenus.description"),
        },
        {
            title: t("stats.totalEvents.title"),
            count: selectedRestaurant?._count?.events,
            icon: <Calendar className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: t("stats.totalEvents.description"),
        },
        {
            title: t("stats.totalFaqs.title"),
            count: selectedRestaurant?._count?.faqCategories,
            icon: <HelpCircle className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: t("stats.totalFaqs.description"),
        },
        {
            title: t("stats.visitorsThisMonth.title"),
            count: monthlyVisits ?? <Loader2 className="animate-spin opacity-80" />,
            icon: <BarChart2 className="h-4 w-4 text-white" />,
            iconBg: 'bg-blue-50',
            description: t("stats.visitorsThisMonth.description"),
            bg: 'from-blue-50',
        },
        {
            title: t("stats.totalVisitors.title"),
            count: selectedRestaurant?._count?.restaurantViews,
            icon: <Users className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: t("stats.totalVisitors.description"),
        },
    ];

    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-4xl font-bold text-main-blue">
                    {t("welcomeTitle")}
                </h1>
                <p className="text-slate-500 mt-2">
                    {t("welcomeSubtitle")}
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                {stats.map((stat, index) => (
                    <motion.div key={index} variants={motionItem}>
                        <Card className={`bg-gradient-to-br ${stat.bg || 'from-slate-50'} to-white box-shad-every hover:shadow-md font-poppins transition-shadow border-slate-400`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                                <div className={`h-8 w-8 rounded-full bg-[#002147] text-white flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{stat.count}</div>
                                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    <SlugPagePreview formData={{
                        bg_color: selectedRestaurant?.bg_color ?? "#ffffff",
                        accent_color: selectedRestaurant?.accent_color ?? "#10b981",
                        headings_text_color: selectedRestaurant?.headings_text_color ?? "#ffffff",
                        button_text_icons_color: selectedRestaurant?.button_text_icons_color ?? "#000000",
                        button_style: selectedRestaurant?.button_style ?? "rounded",
                        font_family: selectedRestaurant?.font_family ?? "var(--font-space-grotesk)",
                        bg_type: selectedRestaurant?.bg_type ?? "color",
                        button_icons_show: selectedRestaurant?.button_icons_show ?? true,
                        social_icon_bg_show: selectedRestaurant?.social_icon_bg_show ?? false,
                        social_icon_bg_color: selectedRestaurant?.social_icon_bg_color ?? "#FFFFFF",
                        social_icon_color: selectedRestaurant?.social_icon_color ?? "#000000",
                        buttons_gap_in_px: selectedRestaurant?.buttons_gap_in_px ?? 16,
                        social_icon_gap: selectedRestaurant?.social_icon_gap ?? 12,
                        bg_gradient_start: selectedRestaurant?.bg_gradient_start ?? "#ffffff",
                        bg_gradient_end: selectedRestaurant?.bg_gradient_end ?? "#f3f4f6",
                        gradient_direction: selectedRestaurant?.gradient_direction ?? "bottom_right",
                        button_variant: selectedRestaurant?.button_variant ?? "solid",
                        bg_image_url: selectedRestaurant?.bg_image_url ?? "",
                        about_heading: selectedRestaurant?.about_heading ?? "",
                        food_heading: selectedRestaurant?.food_heading ?? "",
                        use_headings_in_buttons: selectedRestaurant?.use_headings_in_buttons ?? false,
                    }} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    <QuickActions />
                    <Share selectedRestaurant={selectedRestaurant ? true : false} slug={selectedRestaurant?.slug} />
                    <RecentActivity activityData={activityData} activityLoading={activityLoading} name={selectedRestaurant.name} />
                </motion.div>
            </div>
        </main>
    )
}
