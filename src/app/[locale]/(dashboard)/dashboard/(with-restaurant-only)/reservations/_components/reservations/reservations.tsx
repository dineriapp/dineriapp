"use client"

import LoadingUI from "@/components/loading-ui"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeleteReservation, useReservations, useReservationStats } from "@/lib/reservation-queries"
import { cn } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { Restaurant } from "@prisma/client"
import { format } from "date-fns"

import {
    CalendarIcon,
    CheckCircle2,
    Clock,
    List,
    LogIn,
    Users2,
    XCircle
} from "lucide-react"
import { useState } from "react"
import { DateRange } from "react-day-picker"
import { FcTimeline } from "react-icons/fc"
import { toast } from "sonner"
import { ReservationCard } from "./reservation-card"

export default function ReservationsPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [dateFilter, setDateFilter] = useState("TODAY")
    const [customDate, setCustomDate] = useState<Date | undefined>(new Date())
    const [range, setRange] = useState<DateRange | undefined>(undefined)
    const [view, setView] = useState<"list" | "timeline">("list")
    const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation();

    const handleDelete = (id: string) => {
        deleteReservation(id, {
            onSuccess: () => toast.success("Reservation deleted successfully!"),
            onError: (error) => toast.error(error.message),
        });
    };

    const views = [
        { key: "list", label: "List View", icon: <List className="w-4 h-4" /> },
        { key: "timeline", label: "Timeline", icon: <FcTimeline className="w-4 h-4" /> },
    ]

    const { selectedRestaurant: restaurant } = useRestaurantStore()
    const restaurantId = restaurant?.id

    const { data: reservations = [], isLoading } = useReservations(restaurantId)
    const { data: stats } = useReservationStats(restaurantId)

    const filteredReservations = reservations.filter((res) => {
        const matchesSearch =
            res.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            res.customer_email.toLowerCase().includes(search.toLowerCase()) ||
            res.customer_phone?.includes(search)

        const matchesStatus = statusFilter === "ALL" || res.status === statusFilter

        return matchesSearch && matchesStatus
    })


    if (isLoading) return <LoadingUI text="Loading..." />

    const cardBase =
        "rounded-xl border !gap-3 border-border/60 bg-white backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"

    return (
        <>
            <div className="space-y-4 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Reservations</h2>
                        <p className="text-slate-600 mt-1">
                            Manage all customer reservations efficiently.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Card className={cn(cardBase, "col-span-2")}>
                        <CardHeader className="pb-1 flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users2 className="w-4 h-4 text-primary/80 text-sm" />
                                Total Reservations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">{stats?.total || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className={cardBase}>
                        <CardHeader className="pb-1 flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Confirmed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats?.confirmed || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className={cardBase}>
                        <CardHeader className="pb-1 flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-500" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className={cardBase}>
                        <CardHeader className="pb-1 flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                Cancelled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats?.cancelled || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className={cardBase}>
                        <CardHeader className="pb-1 flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <LogIn className="w-4 h-4 text-blue-500" />
                                Checked In
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{stats?.checkedIn || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Add Button */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 w-full md:w-auto">
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-white"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 bg-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="SEATED">Seated</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                <SelectItem value="NO_SHOW">No show</SelectItem>
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
                                <SelectItem value="TODAY">Today</SelectItem>
                                <SelectItem value="CUSTOM">Custom Date</SelectItem>
                                <SelectItem value="RANGE">Date Range</SelectItem>
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
                                        {customDate ? format(customDate, "PPP") : "Pick a date"}
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
                                            : "Select date range"}
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
                                    "flex items-center gap-2 px-3 py-2 rounded-md transition-all",
                                    view === key
                                        ? "bg-primary text-white shadow-sm hover:bg-primary/90"
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
                    {filteredReservations.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">No reservations found</CardContent>
                        </Card>
                    ) : (
                        filteredReservations.map((reservation) => (
                            <div key={reservation.id} className={isDeleting ? "opacity-50 pointer-events-none" : ""}>
                                <ReservationCard reservation={reservation} restaurant={restaurant as Restaurant} handleDelete={handleDelete} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}




