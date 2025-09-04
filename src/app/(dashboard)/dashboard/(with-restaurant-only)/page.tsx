"use client"

import LoadingUI from "@/components/loading-ui"
import DashabordMobilePreview from "@/components/pages/dashboard/dashabord-mobile-preview"
import QuickActions from "@/components/pages/dashboard/quick-actions"
import RecentActivity from "@/components/pages/dashboard/recent-activity"
import Share from "@/components/pages/dashboard/share"
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
import { useEffect } from "react"

export default function DashboardPage() {
    const { restaurants, selectedRestaurant } = useRestaurantStore()
    const { isLoading, isFetching } = useRestaurants();
    const { data: activityData, isLoading: activityLoading } = useRecentActivity(selectedRestaurant?.id);
    const { fetchAndSet } = useSyncRestaurants();
    const { monthlyVisits } = useMonthlyVisits(selectedRestaurant?.id);



    useEffect(() => {
        fetchAndSet();
    }, []);

    if (restaurants.length === 0 || !selectedRestaurant || isLoading || isFetching) {
        return (
            <LoadingUI text="Loading your dashboard..." />
        )
    }

    const stats = [
        {
            title: 'Total Links',
            count: selectedRestaurant?._count?.links,
            icon: <LinkIcon className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: 'Active links on your page',
        },
        {
            title: 'Total Menus',
            count: selectedRestaurant?._count?.menuCategories,
            icon: <UtensilsCrossed className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: 'Active menus on your page',
        },
        {
            title: 'Total Events',
            count: selectedRestaurant?._count?.events,
            icon: <Calendar className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: 'Active events on your page',
        },
        {
            title: 'Total Faqs',
            count: selectedRestaurant?._count?.faqCategories,
            icon: <HelpCircle className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: 'Active faq categories on your page',
        },
        {
            title: 'Visitors This Month',
            count: monthlyVisits ?? <Loader2 className="animate-spin opacity-80" />,
            icon: <BarChart2 className="h-4 w-4 text-white" />,
            iconBg: 'bg-blue-50',
            description: 'Visitors this month',
            bg: 'from-blue-50',
        },
        {
            title: 'Total Visitors',
            count: selectedRestaurant?._count?.restaurantViews,
            icon: <Users className="h-4 w-4 text-white" />,
            iconBg: 'bg-teal-50',
            description: 'Total visitors all time',
        },
    ];

    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-4xl font-bold text-main-blue">
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
                    <DashabordMobilePreview selectedRestaurant={selectedRestaurant} />
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
