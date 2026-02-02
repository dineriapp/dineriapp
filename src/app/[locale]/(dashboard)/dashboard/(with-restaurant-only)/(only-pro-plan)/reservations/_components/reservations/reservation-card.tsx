"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Locale } from "@/i18n/routing"
import { ReservationUp } from "@/lib/types"
import { formatDateTime } from "@/lib/utils"
import { getPaymentStatusBadge, getReservationStatusIcon } from "@/lib/utils-jsx"
import { ReservationStatus, Restaurant } from "@prisma/client"
import {
    CheckCircle2,
    CheckSquare,
    Clock,
    EuroIcon,
    EyeOff,
    FilePlus2,
    Loader,
    Mail,
    Phone,
    Trash2,
    UserCheck,
    Users,
    XCircle
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { MdNotificationAdd } from "react-icons/md"

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    CONFIRMED: "bg-green-100 text-green-800 border-green-300",
    SEATED: "bg-blue-100 text-blue-800 border-blue-300",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
    NO_SHOW: "bg-gray-200 text-gray-700 border-gray-300",
};


export function ReservationCard({ reservation, UpdateStatus, restaurant, handleDelete, handleSendReminder, isSendingReminder }: {
    reservation: ReservationUp, UpdateStatus: (args: {
        reservationId: string;
        status: ReservationStatus;
    }) => void;
    restaurant: Restaurant,
    handleDelete: (id: string) => void
    handleSendReminder: (id: string) => void,
    isSendingReminder: boolean;

}) {
    const t = useTranslations("reservationsPage.reservationCard")
    const timeZone = restaurant?.timezone || "Asia/Karachi"
    const locale: Locale = useLocale() as Locale
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
                            {t("partyOf", { count: reservation.party_size })}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {getReservationStatusIcon(reservation.status)}
                        <Badge
                            variant="secondary"
                            className="px-3 py-1 font-medium capitalize tracking-wide border-border/50"
                        >
                            {t(`status.${reservation.status.toLowerCase()}`)}
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
                                    {t("timing.arrivalTimeLabel")} {formatDateTime(reservation.arrival_time, timeZone)}
                                    — {t("timing.arrivalTimeHint")}
                                </span>
                            </div>
                        )}

                        {reservation.createdAt && (
                            <div className="flex items-center gap-2">
                                <FilePlus2 className="w-4 h-4 text-blue-500" />
                                <span>
                                    {t("timing.createdAtLabel")} {formatDateTime(reservation.createdAt, timeZone)} — {t("timing.createdAtHint")}
                                </span>
                            </div>
                        )}

                        {reservation.confirmed_at && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>
                                    {t("timing.confirmedAtLabel")}  {formatDateTime(reservation.confirmed_at, timeZone)} —  {t("timing.confirmedAtHint")}
                                </span>
                            </div>
                        )}

                        {reservation.seated_at && (
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-amber-500" />
                                <span>
                                    {t("timing.seatedAtLabel")} {formatDateTime(reservation.seated_at, timeZone)} — {t("timing.seatedAtHint")}
                                </span>
                            </div>
                        )}

                        {reservation.completed_at && (
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                <span>
                                    {t("timing.completedAtLabel")} {formatDateTime(reservation.completed_at, timeZone)} — {t("timing.completedAtHint")}
                                </span>
                            </div>
                        )}

                        {reservation.cancelled_at && (
                            <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span>
                                    {t("timing.cancelledAtLabel")} {formatDateTime(reservation.cancelled_at, timeZone)} — {t("timing.cancelledAtHint")}
                                </span>
                            </div>
                        )}

                        {reservation.no_show_at && (
                            <div className="flex items-center gap-2">
                                <EyeOff className="w-4 h-4 text-gray-400" />
                                <span>
                                    {t("timing.noShowAtLabel")} {formatDateTime(reservation.no_show_at, timeZone)} — {t("timing.noShowAtHint")}
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
                                {getPaymentStatusBadge(reservation.payment.status, locale)}
                            </div>
                        )}
                        {reservation.table_reservations?.length > 0 && (
                            <div className="border rounded-lg px-3 py-2 bg-background/60">
                                <span className="text-muted-foreground">{t("payment.tablesLabel")} </span>
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
                        <span className="font-medium text-foreground">
                            {t("specialRequest.noteLabel")}
                        </span>
                        <span className="text-muted-foreground">{reservation.special_requests}</span>
                    </div>
                )}

                {/* --- Action Buttons --- */}
                <div className="flex flex-wrap gap-2 border-t border-border/30">
                    <Select
                        defaultValue={reservation.status}
                        onValueChange={(value) => {
                            UpdateStatus(
                                { reservationId: reservation.id, status: value as ReservationStatus },

                            );
                        }}
                    >
                        <SelectTrigger className={`w-fit cursor-pointer ${STATUS_COLORS[reservation.status]}`}>
                            <span className="capitalize">{t(`status.${reservation.status.toLowerCase()}`)}</span>
                        </SelectTrigger>

                        <SelectContent>
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
                    <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2 cursor-pointer"
                        onClick={() => handleDelete(reservation.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                        {t("actions.delete")}
                    </Button>
                    {
                        reservation.reminder_sent ? null : (
                            <Button
                                size="sm"
                                variant="default"
                                className="gap-2 cursor-pointer"
                                disabled={isSendingReminder}
                                onClick={() => handleSendReminder(reservation.id)}
                            >
                                {isSendingReminder ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <MdNotificationAdd className="w-4 h-4" />
                                )}
                                {t("actions.sendReminder")}
                            </Button>
                        )
                    }

                </div>
            </CardContent>
        </Card>
    )
}
