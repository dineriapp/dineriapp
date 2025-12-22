"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeleteReservation, useReservations, useUpdateReservationStatus } from "@/lib/reservation-queries"
import { cn } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { Restaurant } from "@prisma/client"
import { format } from "date-fns"

import {
    CalendarIcon,
    List
} from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { FcTimeline } from "react-icons/fc"
import { toast } from "sonner"
import { ReservationCard } from "./reservation-card"
import { ReservationTimeline } from "./timeline-view"
import { useTranslations } from "next-intl"

const ReservationCardSkeleton = () => (
    <Card className="rounded-xl border border-border/60 bg-white animate-pulse">
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
            </div>
        </CardContent>
    </Card>
);

export default function ReservationsPage() {
    const t = useTranslations("reservationsPage")
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [dateFilter, setDateFilter] = useState("ALL")
    const [customDate, setCustomDate] = useState<Date | undefined>(new Date())
    const [range, setRange] = useState<DateRange | undefined>(undefined)
    const [view, setView] = useState<"list" | "timeline">("list")
    const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation();
    const { mutate: UpdateStatus, isPending: isUpdating } = useUpdateReservationStatus();

    const handleDelete = (id: string) => {
        deleteReservation(id, {
            onSuccess: () => toast.success(t("toast.deleteSuccess")),
            onError: (error) => toast.error(error.message),
        });
    };

    const views = [
        { key: "list", label: t("view.list"), icon: <List className="w-4 h-4" /> },
        { key: "timeline", label: t("view.timeline"), icon: <FcTimeline className="w-4 h-4" /> },
    ]

    const { selectedRestaurant: restaurant } = useRestaurantStore()
    const restaurantId = restaurant?.id

    // Build query parameters based on date filter selection
    const getQueryParams = () => {
        const params: any = { restaurantId };

        // Helper function to format date as YYYY-MM-DD in local timezone
        const formatLocalDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        switch (dateFilter) {
            case "TODAY":
                params.date = formatLocalDate(new Date());
                break;
            case "CUSTOM":
                if (customDate) {
                    params.date = formatLocalDate(customDate);
                }
                break;
            case "RANGE":
                // Only add range parameters if both from and to dates are selected
                if (range?.from && range?.to) {
                    params.from = formatLocalDate(range.from);
                    params.to = formatLocalDate(range.to);
                }
                break;
            case "ALL":
                // No date parameters - will return all reservations
                break;
        }
        return params;
    };

    // Determine if we should fetch data based on current filter state
    const shouldFetchData = () => {
        if (!restaurantId) return false;

        switch (dateFilter) {
            case "CUSTOM":
                return !!customDate;
            case "RANGE":
                return !!(range?.from && range?.to);
            case "TODAY":
            case "ALL":
            default:
                return true;
        }
    };

    const queryParams = getQueryParams();
    const shouldFetch = shouldFetchData();

    const { data: reservations = [], isLoading: reservationsLoading } = useReservations(queryParams, shouldFetch);

    const filteredReservations = reservations.filter((res) => {
        const matchesSearch =
            res.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            res.customer_email.toLowerCase().includes(search.toLowerCase()) ||
            res.customer_phone?.includes(search)

        const matchesStatus = statusFilter === "ALL" || res.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Reset custom date and range when switching between date filters
    useEffect(() => {
        if (dateFilter === "TODAY") {
            setCustomDate(new Date());
            setRange(undefined);
        } else if (dateFilter === "CUSTOM") {
            setRange(undefined);
        } else if (dateFilter === "RANGE") {
            setCustomDate(undefined);
        } else if (dateFilter === "ALL") {
            setCustomDate(undefined);
            setRange(undefined);
        }
    }, [dateFilter]);

    return (
        <>
            <div className="space-y-4 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {t("title")}
                        </h2>
                        <p className="text-slate-600 mt-1">
                            {t("subtitle")}
                        </p>
                    </div>
                </div>

                {/* Filters and Add Button - Always visible and interactive */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 w-full md:w-auto">
                        <Input
                            placeholder={t("searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-white"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 bg-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    {t("status.all")}
                                </SelectItem>
                                <SelectItem value="PENDING">
                                    {t("status.pending")}
                                </SelectItem>
                                <SelectItem value="CONFIRMED">
                                    {t("status.confirmed")}
                                </SelectItem>
                                <SelectItem value="SEATED">
                                    {t("status.seated")}
                                </SelectItem>
                                <SelectItem value="COMPLETED">
                                    {t("status.completed")}
                                </SelectItem>
                                <SelectItem value="CANCELLED">
                                    {t("status.cancelled")}
                                </SelectItem>
                                <SelectItem value="NO_SHOW">
                                    {t("status.noShow")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={dateFilter}
                            onValueChange={setDateFilter}
                        >
                            <SelectTrigger className="w-40 bg-white border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    {t("date.all")}
                                </SelectItem>
                                <SelectItem value="TODAY">
                                    {t("date.today")}
                                </SelectItem>
                                <SelectItem value="CUSTOM">
                                    {t("date.custom")}
                                </SelectItem>
                                <SelectItem value="RANGE">
                                    {t("date.range")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {/* Custom Date Picker */}
                        {dateFilter === "CUSTOM" && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-44 justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                        <span className="truncate">
                                            {customDate ? format(customDate, "PPP") : t("date.pickDate")}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={customDate}
                                        onSelect={setCustomDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Date Range Picker */}
                        {dateFilter === "RANGE" && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-60 justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                        {range?.from && range?.to
                                            ? `${format(range.from, "LLL dd")} – ${format(range.to, "LLL dd, yyyy")}`
                                            : t("date.selectRange")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        selected={range}
                                        onSelect={setRange}
                                        numberOfMonths={2}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                    <div className="flex items-center bg-white border border-border rounded-lg p-1">
                        {views.map(({ key, label, icon }) => (
                            <Button
                                key={key}
                                variant="ghost"
                                size="sm"
                                onClick={() => setView(key as any)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all",
                                    view === key
                                        ? "bg-primary text-white hover:text-white shadow-sm hover:bg-primary/90"
                                        : "text-muted-foreground hover:bg-muted/70"
                                )}
                            >
                                {icon}
                                <span className="text-sm font-medium">{label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
                {/* Reservations List */}
                <div className="space-y-3">
                    {
                        view === "timeline" ?
                            <>
                                <ReservationTimeline
                                    reservations={filteredReservations}
                                    selectedDate={
                                        dateFilter === "CUSTOM"
                                            ? customDate
                                            : dateFilter === "TODAY"
                                                ? new Date()
                                                : undefined
                                    }
                                    isLoading={reservationsLoading}
                                />
                            </>
                            :
                            <>
                                {reservationsLoading ? (
                                    // Show skeleton loading for reservations
                                    <>
                                        {Array.from({ length: 2 }).map((_, index) => (
                                            <ReservationCardSkeleton key={index} />
                                        ))}
                                    </>
                                ) : filteredReservations.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-6 text-center text-muted-foreground">
                                            {t("empty.noReservations")}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    filteredReservations.map((reservation) => (
                                        <div key={reservation.id} className={isDeleting || isUpdating ? "opacity-50 pointer-events-none" : ""}>
                                            <ReservationCard
                                                reservation={reservation}
                                                UpdateStatus={UpdateStatus}
                                                restaurant={restaurant as Restaurant}
                                                handleDelete={handleDelete}
                                            />
                                        </div>
                                    ))
                                )}
                            </>
                    }

                </div>
            </div>
        </>
    )
}