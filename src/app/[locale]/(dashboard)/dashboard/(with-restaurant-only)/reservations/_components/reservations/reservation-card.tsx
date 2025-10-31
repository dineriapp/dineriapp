"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReservationUp } from "@/lib/types"
import { formatDateTime } from "@/lib/utils"
import { getPaymentStatusBadge, getReservationStatusIcon } from "@/lib/utils-jsx"
import { Restaurant } from "@prisma/client"

import {
    CheckCircle2,
    CheckSquare,
    Clock,
    Edit,
    EuroIcon,
    EyeOff,
    FilePlus2,
    Mail,
    Phone,
    Trash2,
    UserCheck,
    Users,
    XCircle
} from "lucide-react"


export function ReservationCard({ reservation, restaurant }: { reservation: ReservationUp, restaurant: Restaurant }) {
    const timeZone = restaurant?.timezone || "Asia/Karachi"

    return (
        <Card className="hover:shadow-lg bg-white border-border/70 gap-0 py-0 transition-all duration-200 rounded-xl overflow-hidden">
            <CardContent className="px-5 py-4 space-y-3">
                {/* --- Header --- */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                        <h3 className="font-semibold text-lg text-foreground">{reservation.customer_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {reservation.customer_email}
                            {reservation.customer_phone && (
                                <>
                                    <span className="mx-1 text-border">•</span>
                                    <Phone className="w-4 h-4" />
                                    {reservation.customer_phone}
                                </>
                            )}
                            <span className="mx-1 text-border">•</span>
                            <Users className="w-4 h-4" />
                            Party of {reservation.party_size}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {getReservationStatusIcon(reservation.status)}
                        <Badge
                            variant="secondary"
                            className="px-3 py-1 font-medium capitalize tracking-wide border-border/50"
                        >
                            {reservation.status.toLowerCase()}
                        </Badge>
                    </div>
                </div>

                {/* --- Timing + Lifecycle --- */}
                <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-3">
                    <div className="grid gap-y-1 text-muted-foreground/90">
                        {reservation.arrival_time && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>
                                    Arrival Time: {formatDateTime(reservation.arrival_time, timeZone)} — Guest expected arrival
                                </span>
                            </div>
                        )}

                        {reservation.createdAt && (
                            <div className="flex items-center gap-2">
                                <FilePlus2 className="w-4 h-4 text-blue-500" />
                                <span>
                                    Created At: {formatDateTime(reservation.createdAt, timeZone)} — Reservation created
                                </span>
                            </div>
                        )}

                        {reservation.confirmed_at && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>
                                    Confirmed At: {formatDateTime(reservation.confirmed_at, timeZone)} — Reservation confirmed
                                </span>
                            </div>
                        )}

                        {reservation.seated_at && (
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-amber-500" />
                                <span>
                                    Seated At: {formatDateTime(reservation.seated_at, timeZone)} — Guest seated
                                </span>
                            </div>
                        )}

                        {reservation.completed_at && (
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                <span>
                                    Completed At: {formatDateTime(reservation.completed_at, timeZone)} — Reservation completed
                                </span>
                            </div>
                        )}

                        {reservation.cancelled_at && (
                            <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span>
                                    Cancelled At: {formatDateTime(reservation.cancelled_at, timeZone)} — Reservation cancelled
                                </span>
                            </div>
                        )}

                        {reservation.no_show_at && (
                            <div className="flex items-center gap-2">
                                <EyeOff className="w-4 h-4 text-gray-400" />
                                <span>
                                    No-Show At: {formatDateTime(reservation.no_show_at, timeZone)} — Guest did not arrive
                                </span>
                            </div>
                        )}

                    </div>
                </div>

                {/* --- Payment & Tables --- */}
                {(reservation.payment || reservation.table_reservations?.length > 0) && (
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        {reservation.payment && (
                            <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-background/60">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <EuroIcon className="w-4 h-4 text-primary/80" />
                                    <span className="font-semibold text-foreground">
                                        {Number(reservation.payment.amount).toFixed(2)}
                                    </span>
                                </div>
                                {getPaymentStatusBadge(reservation.payment.status)}
                            </div>
                        )}
                        {reservation.table_reservations?.length > 0 && (
                            <div className="border rounded-lg px-3 py-2 bg-background/60">
                                <span className="text-muted-foreground">Tables: </span>
                                <span className="font-medium text-foreground">
                                    {reservation.table_reservations.map((t: any) => t.table?.table_number).join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* --- Special Request --- */}
                {reservation.special_requests && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-lg text-sm border border-border/30">
                        <span className="font-medium text-foreground">Note: </span>
                        <span className="text-muted-foreground">{reservation.special_requests}</span>
                    </div>
                )}

                {/* --- Action Buttons --- */}
                <div className="flex flex-wrap gap-2 border-t border-border/30">
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-border/60 bg-background/70 hover:bg-background/90"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
