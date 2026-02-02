"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useReservationAnalyticsDayCapacity } from "@/lib/reservation-queries";
import clsx from "clsx";
import { Clock, Gauge } from "lucide-react";
import { useTranslations } from "next-intl";

const DayCapacity = ({
    restaurant_id,
    formatted_date
}: {
    restaurant_id: string | undefined;
    formatted_date: string;
}) => {
    const t = useTranslations("overviewPage.dayCapacity")

    const {
        data,
        isLoading,
        error,
        isError,
        isPending,
        isRefetching,
        refetch
    } = useReservationAnalyticsDayCapacity(restaurant_id, formatted_date);

    const slots = data?.data?.slots || [];

    const isInitialLoading = isLoading || isPending;

    return (
        <div className="relative w-full h-full p-4 rounded-2xl bg-white shadow-sm border">

            {/* Refetch overlay spinner */}
            {isRefetching && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl z-10">
                    <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                <Gauge className="w-6 h-6 text-blue-600" />
                {t("title")}
            </h2>

            {/* ERROR STATE */}
            {isError && (
                <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-xl mb-4">
                    <div className="font-medium">
                        {t("error.title")}
                    </div>
                    <div className="text-sm mt-1">{(error as any)?.message}</div>
                    <button
                        onClick={() => refetch()}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                    >
                        {t("error.retry")}
                    </button>
                </div>
            )}

            {/* SKELETON LOADING STATE */}
            {isInitialLoading && (
                <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-4 gap-4 px-3 py-2 bg-gray-100 rounded-lg">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                    </div>

                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-4 gap-4 p-3 border rounded-xl"
                        >
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            )}

            {/* EMPTY STATE */}
            {!isInitialLoading && !isError && slots.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                    {t("empty.noSlots")}
                </div>
            )}

            {/* CONTENT */}
            {!isInitialLoading && !isError && slots.length > 0 && (
                <div className="mt-3">

                    {/* Header */}
                    <div className="grid grid-cols-4 gap-4 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                        <div>
                            {t("table.time")}
                        </div>
                        <div>
                            {t("table.used")}
                        </div>
                        <div>
                            {t("table.total")}
                        </div>
                        <div>
                            {t("table.max")}
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="grid grid-cols-1 gap-2 mt-2 overflow-y-auto h-[240px]">
                        {slots.map((slot: any, index: number) => {

                            const pct = slot.current_capacity / slot.max_capacity;

                            const color = clsx({
                                "text-green-600 font-semibold": pct < 0.5,
                                "text-yellow-600 font-semibold": pct >= 0.5 && pct < 0.9,
                                "text-red-600 font-semibold": pct >= 0.9,
                            });

                            return (
                                <div
                                    key={index}
                                    className="grid grid-cols-4 gap-4 p-3 rounded-xl border bg-white hover:bg-gray-50 transition"
                                >
                                    <div className="font-medium text-gray-800 flex items-center justify-start gap-2"><Clock className="size-4" />{slot.label}</div>

                                    <div className={color}>
                                        {slot.current_capacity} / {slot.max_capacity}
                                    </div>

                                    <div className="text-blue-600 font-semibold">
                                        {slot.available_capacity}
                                    </div>

                                    <div className="text-gray-500">{slot.max_capacity}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DayCapacity;
