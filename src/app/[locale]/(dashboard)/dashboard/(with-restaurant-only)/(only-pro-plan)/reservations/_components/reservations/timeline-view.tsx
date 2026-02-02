"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Locale } from "@/i18n/routing"
import { ReservationUp } from "@/lib/types"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { format } from "date-fns"
import { de, enUS, es, fr, it, nl } from "date-fns/locale"
import { Columns, Loader, Rows } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import HorizontalTimeline from "./horizontal-timeline"
import VerticalTimeline from "./vertical-timeline"
type TimelineOrientation = 'horizontal' | 'vertical';

const locales = {
    de: de,
    en: enUS,
    es: es,
    fr: fr,
    it: it,
    nl: nl,
};

interface ReservationTimelineProps {
    reservations: ReservationUp[]
    selectedDate: Date | undefined
    isLoading: boolean
}

export function ReservationTimeline({ reservations, selectedDate, isLoading }: ReservationTimelineProps) {
    const [orientation, setOrientation] = useState<TimelineOrientation>('horizontal');
    const t = useTranslations("reservationTimeline")

    const locale = useLocale() as Locale
    const { selectedRestaurant } = useRestaurantStore()
    if (!selectedDate) {
        return (
            <Card className="rounded-xl border border-border/60 bg-white">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                        {t("selectDatePrompt")}
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (isLoading || !selectedRestaurant) {
        return (
            <Card className="rounded-xl border border-border/60 bg-white">
                <CardContent className="p-6 text-center w-full flex items-center justify-center flex-col">
                    <Loader className="animate-spin" />
                    <p>
                        {t("loading")}
                    </p>
                </CardContent>
            </Card>
        )
    }


    if (reservations.length === 0) {
        return (
            <Card className="rounded-xl border border-border/60 bg-white">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                        {t("noReservationsForDate", { date: format(selectedDate, "EEEE, MMMM d, yyyy") })}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-xl border p-0 border-border/60 bg-white overflow-hidden">
            <CardContent className="py-1 px-5">
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="sticky top-0 z-10 ">
                            <div className="py-3">
                                <h3 className="font-semibold text-xl text-slate-900">
                                    {format(selectedDate, "EEEE, MMMM d, yyyy", { locale: locales[locale as Locale] ?? enUS })}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    {t("header.reservationsCount", { count: reservations.length })}
                                </p>
                            </div>
                        </div>
                        <div className="flex rounded-md border border-slate-200 p-1 bg-gray-100 w-fit">
                            <button
                                onClick={() => setOrientation('horizontal')}
                                className={`px-2 md:px-3 py-2 cursor-pointer flex items-center justify-center gap-2 rounded-sm text-xs font-medium transition-colors ${orientation === 'horizontal' ? 'bg-white text-black' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="hidden md:inline">
                                    {t("orientation.horizontal")}
                                </span>
                                <span className="md:hidden">
                                    {t("orientation.horizontalShort")}
                                </span>
                                <Columns className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setOrientation('vertical')}
                                className={`px-2 md:px-3 py-2 cursor-pointer flex items-center justify-center gap-2 rounded-sm text-xs font-medium transition-colors ${orientation === 'vertical' ? 'bg-white text-black' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="hidden md:inline">
                                    {t("orientation.vertical")}
                                </span>
                                <span className="md:hidden">
                                    {t("orientation.verticalShort")}
                                </span>
                                <Rows className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="w-full relative">
                        {/* Timeline Container */}
                        {orientation === 'horizontal' ? <HorizontalTimeline reservations={reservations} timezone={selectedRestaurant?.timezone || "Europe/Rome"} /> : <VerticalTimeline reservations={reservations} timezone={selectedRestaurant?.timezone || "Europe/Rome"} />}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
