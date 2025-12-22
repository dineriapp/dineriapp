"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReservationAnalyticsStatusBreakdown } from "@/lib/reservation-queries"
import {
    BarChart3,
    CheckCircle,
    Clock,
    ThumbsUp,
    Users,
    UserX,
    XCircle
} from "lucide-react"
import { useTranslations } from "next-intl"

const StatusBreakdown = ({
    restaurant_id,
    formatted_date
}: {
    restaurant_id: string | undefined
    formatted_date: string
}) => {
    const t = useTranslations("overviewPage.statusBreakdown")

    const {
        data,
        isLoading,
        error,
        isError,
        isPending,
        isRefetching,
        refetch
    } = useReservationAnalyticsStatusBreakdown(restaurant_id, formatted_date)

    const statusConfig = {
        pending_reservations: {
            label: t("labels.pending"),
            color: "bg-yellow-50 border-yellow-200 text-yellow-800",
            icon: Clock
        },
        confirmed_reservations: {
            label: t("labels.confirmed"),
            color: "bg-blue-50 border-blue-200 text-blue-800",
            icon: CheckCircle
        },
        seated_reservations: {
            label: t("labels.seated"),
            color: "bg-purple-50 border-purple-200 text-purple-800",
            icon: Users
        },
        completed_reservations: {
            label: t("labels.completed"),
            color: "bg-green-50 border-green-200 text-green-800",
            icon: ThumbsUp
        },
        cancelled_reservations: {
            label: t("labels.cancelled"),
            color: "bg-red-50 border-red-200 text-red-800",
            icon: XCircle
        },
        no_show_reservations: {
            label: t("labels.noShow"),
            color: "bg-gray-50 border-gray-200 text-gray-800",
            icon: UserX
        }
    }

    const statusBreakdown = data?.data.status_breakdown

    if (isLoading || isPending || isRefetching) {
        return (
            <Card className="gap-3 p-4">
                <CardHeader className="p-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 gap-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-12 w-full rounded-md"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isError || error) {
        return (
            <Card className="gap-3 p-4">
                <CardHeader className="p-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                    <XCircle className="h-10 w-10 text-red-500 mb-2" />
                    <p className="text-sm text-red-600 mb-2">
                        {t("error.message")}
                    </p>
                    <Button variant="outline" onClick={() => refetch()}>
                        {t("error.retry")}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="gap-3 p-4">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    {t("title")}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <div className="grid grid-cols-1 gap-1">
                    {Object.entries(statusConfig).map(([key, config]) => {
                        const StatusIcon = config.icon
                        return (
                            <div
                                key={key}
                                className={`border rounded-lg flex items-center justify-between px-3 py-2 ${config.color}`}
                            >
                                <div className="flex items-center gap-2">
                                    <StatusIcon className="h-4 w-4" />
                                    <div className="text-sm font-medium">
                                        {config.label}
                                    </div>
                                </div>
                                <div className="text-xl font-bold">
                                    {statusBreakdown?.[
                                        key as keyof typeof statusBreakdown
                                    ] || 0}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default StatusBreakdown
