"use client"

import LoadingUI from "@/components/loading-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAreas } from "@/lib/area-queries"
import { useCreateReservation, useDeleteReservation, useReservations, useReservationStats, useUpdateReservation } from "@/lib/reservation-queries"
import { useTables } from "@/lib/table-queries"
import { CreateReservationInput, ReservationUp, UpdateReservationInput } from "@/lib/types"
import { useRestaurantStore } from "@/stores/restaurant-store"
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    EuroIcon,
    Mail,
    Phone,
    PlusCircle,
    Trash2,
    Users,
    XCircle
} from "lucide-react"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

const fmt = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});


const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const date = new Date();
    date.setHours(Math.floor(i / 2), i % 2 === 0 ? 0 : 30, 0, 0);
    const str = fmt.format(date);
    return { value: str, label: str };
});

export default function ReservationsPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingReservation, setEditingReservation] = useState<ReservationUp | null>(null)
    const [selectedTables, setSelectedTables] = useState<string[]>([])




    const { selectedRestaurant: restaurant } = useRestaurantStore()
    const restaurantId = restaurant?.id

    const { data: reservations = [], isLoading } = useReservations(restaurantId)
    const { data: stats } = useReservationStats(restaurantId)
    const { data: areas = [] } = useAreas(restaurantId)
    const { data: tables = [] } = useTables(restaurantId)

    const createMutation = useCreateReservation(restaurantId)
    const updateMutation = useUpdateReservation(restaurantId)
    const deleteMutation = useDeleteReservation(restaurantId)

    const [formData, setFormData] = useState<CreateReservationInput>({
        name: "",
        email: "",
        phone: "",
        date: new Date(),
        fromTime: "",
        endTime: "",
        partySize: 1,
        preferredArea: "",
        specialRequest: "",
        status: "PENDING",
        source: "PHONE",
        payment: {
            paidAmount: 0,
            totalAmount: 0,
            currency: "EUR",
            method: "",
            paymentStatus: "PENDING",
        },
    })

    const handleAddReservation = async (e: React.FormEvent) => {
        e.preventDefault()
        const {
            name,
            email,
            phone,
            date,
            fromTime,
            endTime,
            partySize,
            preferredArea,
            specialRequest,
            status,
            source,
            payment,
        } = formData;

        // ✅ Check if any field is missing
        const isMissing =
            !name.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !date ||
            !fromTime.trim() ||
            !endTime.trim() ||
            !partySize ||
            !preferredArea.trim() ||
            !specialRequest.trim() ||
            !status.trim() ||
            !source.trim() ||
            !payment ||
            payment.paidAmount === null ||
            payment.method === null ||
            payment.totalAmount === null ||
            !payment.paymentStatus.trim() ||
            selectedTables.length === 0;

        if (isMissing) {
            toast.error("⚠️ Missing Required Fields", {
                description: "Please fill out all fields before creating a reservation.",
            });
            return;
        }
        try {
            await createMutation.mutateAsync({
                ...formData,
                tableIds: selectedTables,
            })
            setFormData({
                name: "",
                email: "",
                phone: "",
                date: new Date(),
                fromTime: "",
                endTime: "",
                partySize: 1,
                preferredArea: "",
                specialRequest: "",
                status: "PENDING",
                source: "PHONE",
                payment: {
                    paidAmount: 0,
                    method: payment.method,
                    totalAmount: 0,
                    currency: "EUR",
                    paymentStatus: "PENDING",
                },
            })
            setSelectedTables([])
            setDialogOpen(false)
        } catch (error) {
            console.error("Failed to create reservation:", error)
        }
    }

    const handleEditReservation = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingReservation) return

        try {
            const updateData: UpdateReservationInput = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                date: formData.date,
                fromTime: formData.fromTime,
                endTime: formData.endTime,
                partySize: formData.partySize,
                preferredArea: formData.preferredArea,
                specialRequest: formData.specialRequest,
                status: formData.status as "PENDING" | "CONFIRMED" | "CANCELLED",
                tableIds: selectedTables,
                payment: formData.payment,
            }

            await updateMutation.mutateAsync({
                reservationId: editingReservation.id,
                data: updateData,
            })

            setEditingReservation(null)
            setEditDialogOpen(false)
            setFormData({
                name: "",
                email: "",
                phone: "",
                date: new Date(),
                fromTime: "",
                endTime: "",
                partySize: 1,
                preferredArea: "",
                specialRequest: "",
                status: "PENDING",
                source: "PHONE",
                payment: {
                    paidAmount: 0,
                    totalAmount: 0,
                    method: formData.payment?.method || "",
                    currency: "EUR",
                    paymentStatus: "PENDING",
                },
            })
            setSelectedTables([])
        } catch (error) {
            console.error("Failed to update reservation:", error)
        }
    }

    const handleDeleteReservation = async (id: string) => {
        if (confirm("Are you sure you want to delete this reservation?")) {
            try {
                await deleteMutation.mutateAsync(id)
            } catch (error) {
                console.error("Failed to delete reservation:", error)
            }
        }
    }

    const openEditDialog = (reservation: ReservationUp) => {
        setEditingReservation(reservation)
        setFormData({
            name: reservation.name,
            email: reservation.email,
            phone: reservation.phone || "",
            date: new Date(reservation.date),
            fromTime: reservation.fromTime,
            endTime: reservation.endTime,
            partySize: reservation.partySize,
            preferredArea: reservation.preferredArea,
            specialRequest: reservation.specialRequest,
            status: reservation.status,
            source: reservation.source,
            payment: reservation.payment
                ? {
                    paidAmount: Number(reservation.payment.paidAmount),
                    totalAmount: Number(reservation.payment.totalAmount),
                    currency: reservation.payment.currency,
                    paymentStatus: reservation.payment.paymentStatus,
                    method: reservation.payment.method || "",
                }
                : undefined,
        })
        setSelectedTables(reservation.tableLinks?.map((t) => t.tableId) || [])
        setEditDialogOpen(true)
    }

    const filteredReservations = reservations.filter((res) => {
        const matchesSearch =
            res.name.toLowerCase().includes(search.toLowerCase()) ||
            res.email.toLowerCase().includes(search.toLowerCase()) ||
            res.phone?.includes(search)

        const matchesStatus = statusFilter === "ALL" || res.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "PENDING":
                return <AlertCircle className="w-4 h-4 text-yellow-500" />
            case "CANCELLED":
                return <XCircle className="w-4 h-4 text-red-500" />
            default:
                return null
        }
    }

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return <Badge className="bg-green-500">Paid</Badge>
            case "PENDING":
                return <Badge className="bg-yellow-500">Pending</Badge>
            case "FAILED":
                return <Badge className="bg-red-500">Failed</Badge>
            case "REFUNDED":
                return <Badge className="bg-blue-500">Refunded</Badge>
            default:
                return null
        }
    }

    if (isLoading) return <LoadingUI text="Loading..." />


    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Reservations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.confirmed || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.cancelled || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats?.checkedIn || 0}</div>
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
                        className="flex-1"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Add Reservation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Reservation</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleAddReservation} className="space-y-6">
                            {/* Customer Details */}
                            <div className="space-y-3">
                                <Label className="text-lg font-semibold">Customer Details</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            className="w-full"
                                            placeholder="Enter full name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="w-full"
                                            placeholder="example@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            className="w-full"
                                            placeholder="Enter phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="partySize">Party Size *</Label>
                                        <Input
                                            id="partySize"
                                            type="number"
                                            min="1"
                                            className="w-full"
                                            placeholder="e.g., 4"
                                            value={formData.partySize}
                                            onChange={(e) =>
                                                setFormData({ ...formData, partySize: Number.parseInt(e.target.value) })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reservation Details */}
                            <div className="space-y-3">
                                <Label className="text-lg font-semibold">Reservation Details</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            className="w-full"
                                            placeholder="Select date"
                                            value={formData.date ? new Date(formData.date).toISOString().split("T")[0] : ""}
                                            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="fromTime">From Time *</Label>
                                        <Select
                                            value={formData.fromTime}
                                            onValueChange={(val) => setFormData({ ...formData, fromTime: val })}
                                        >
                                            <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                                <SelectValue placeholder={"Select From Time"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={`-${slot.value}`} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="endTime">End Time *</Label>
                                        <Select
                                            value={formData.endTime}
                                            onValueChange={(val) => setFormData({ ...formData, endTime: val })}
                                        >
                                            <SelectTrigger className="focus:border-emerald-500 focus:ring-emerald-500 w-full">
                                                <SelectValue placeholder={"Select End Time"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={`-${slot.value}`} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="preferredArea">Preferred Area *</Label>
                                        <Select
                                            value={formData.preferredArea}
                                            onValueChange={(value) => setFormData({ ...formData, preferredArea: value })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {areas.map((area) => (
                                                    <SelectItem key={area.id} value={area.id}>
                                                        {area.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="space-y-3">
                                <Label className="text-lg font-semibold">Payment Details</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="totalAmount">Total Amount *</Label>
                                        <Input
                                            id="totalAmount"
                                            type="number"
                                            step="0.01"
                                            className="w-full"
                                            placeholder="e.g., 50.00"
                                            value={formData.payment?.totalAmount || 0}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    payment: {
                                                        ...formData.payment!,
                                                        totalAmount: Number.parseFloat(e.target.value),
                                                    },
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="paidAmount">Paid Amount</Label>
                                        <Input
                                            id="paidAmount"
                                            type="number"
                                            step="0.01"
                                            className="w-full"
                                            placeholder="e.g., 20.00"
                                            value={formData.payment?.paidAmount || 0}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    payment: {
                                                        ...formData.payment!,
                                                        paidAmount: Number.parseFloat(e.target.value),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="paymentStatus">Payment Status</Label>
                                        <Select
                                            value={formData.payment?.paymentStatus || "PENDING"}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    payment: {
                                                        ...formData.payment!,
                                                        paymentStatus: value as "PENDING" | "PAID" | "FAILED" | "REFUNDED",
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="PAID">Paid</SelectItem>
                                                <SelectItem value="FAILED">Failed</SelectItem>
                                                <SelectItem value="REFUNDED">Refunded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="method">Payment Method</Label>
                                        <Input
                                            id="method"
                                            className="w-full"
                                            placeholder="e.g., Cash, Card, Online"
                                            value={formData.payment?.method || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    payment: { ...formData.payment!, method: e.target.value },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-3">
                                <Label className="text-lg font-semibold">Additional Info</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="source">Source</Label>
                                        <Select
                                            value={formData.source}
                                            onValueChange={(value) => setFormData({ ...formData, source: value as any })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PHONE">Phone</SelectItem>
                                                <SelectItem value="WALK_IN">Walk In</SelectItem>
                                                <SelectItem value="ONLINE">Online</SelectItem>
                                                <SelectItem value="PARTNER">Partner</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Special Request */}
                            <div className="space-y-1">
                                <Label htmlFor="specialRequest">Special Request</Label>
                                <Textarea
                                    id="specialRequest"
                                    className="w-full"
                                    placeholder="Any special requests or notes..."
                                    value={formData.specialRequest}
                                    onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create Reservation"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>


            </div>

            {/* Reservations List */}
            <div className="space-y-4">
                {filteredReservations.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">No reservations found</CardContent>
                    </Card>
                ) : (
                    filteredReservations.map((reservation) => (
                        <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Left Column */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">{reservation.name}</h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(reservation.status)}
                                                <Badge variant="outline">{reservation.status}</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                {reservation.email}
                                            </div>
                                            {reservation.phone && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="w-4 h-4" />
                                                    {reservation.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                Party of {reservation.partySize}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-3">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(reservation.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                {reservation.fromTime} - {reservation.endTime}
                                            </div>
                                            {reservation.payment && (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <EuroIcon className="w-4 h-4" />{Number(reservation.payment.totalAmount).toFixed(2)}
                                                    </div>
                                                    {getPaymentStatusBadge(reservation.payment.paymentStatus)}
                                                </div>
                                            )}
                                        </div>

                                        {reservation.tableLinks && reservation.tableLinks.length > 0 && (
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Tables: </span>
                                                <span className="font-medium">
                                                    {reservation.tableLinks.map((t) => t.table?.tableNumber).join(", ")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {reservation.specialRequest && (
                                    <div className="mt-4 p-2 bg-muted rounded text-sm">
                                        <span className="font-medium">Note: </span>
                                        {reservation.specialRequest}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-4">
                                    <Dialog
                                        open={editDialogOpen && editingReservation?.id === reservation.id}
                                        onOpenChange={setEditDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 bg-transparent"
                                                onClick={() => openEditDialog(reservation)}
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Edit Reservation</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleEditReservation} className="space-y-4">
                                                {/* Same form fields as create */}
                                                <div className="space-y-2">
                                                    <Label className="text-base font-semibold">Customer Details</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="edit-name">Name *</Label>
                                                            <Input
                                                                id="edit-name"
                                                                value={formData.name}
                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-email">Email *</Label>
                                                            <Input
                                                                id="edit-email"
                                                                type="email"
                                                                value={formData.email}
                                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-phone">Phone</Label>
                                                            <Input
                                                                id="edit-phone"
                                                                value={formData.phone}
                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-partySize">Party Size *</Label>
                                                            <Input
                                                                id="edit-partySize"
                                                                type="number"
                                                                min="1"
                                                                value={formData.partySize}
                                                                onChange={(e) =>
                                                                    setFormData({ ...formData, partySize: Number.parseInt(e.target.value) })
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-base font-semibold">Reservation Details</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="edit-date">Date *</Label>
                                                            <Input
                                                                id="edit-date"
                                                                type="date"
                                                                value={formData.date ? new Date(formData.date).toISOString().split("T")[0] : ""}
                                                                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-fromTime">From Time *</Label>
                                                            <Input
                                                                id="edit-fromTime"
                                                                type="time"
                                                                value={formData.fromTime}
                                                                onChange={(e) => setFormData({ ...formData, fromTime: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-endTime">End Time *</Label>
                                                            <Input
                                                                id="edit-endTime"
                                                                type="time"
                                                                value={formData.endTime}
                                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-preferredArea">Preferred Area *</Label>
                                                            <Select
                                                                value={formData.preferredArea}
                                                                onValueChange={(value) => setFormData({ ...formData, preferredArea: value })}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select area" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {areas.map((area) => (
                                                                        <SelectItem key={area.id} value={area.id}>
                                                                            {area.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-base font-semibold">Assign Tables</Label>
                                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                                                        {tables.map((table) => (
                                                            <label key={table.id} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedTables.includes(table.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedTables([...selectedTables, table.id])
                                                                        } else {
                                                                            setSelectedTables(selectedTables.filter((id) => id !== table.id))
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="text-sm">
                                                                    Table {table.tableNumber} (Cap: {table.capacity})
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-base font-semibold">Payment Details</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="edit-totalAmount">Total Amount *</Label>
                                                            <Input
                                                                id="edit-totalAmount"
                                                                type="number"
                                                                step="0.01"
                                                                value={formData.payment?.totalAmount || 0}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        payment: {
                                                                            ...formData.payment!,
                                                                            totalAmount: Number.parseFloat(e.target.value),
                                                                        },
                                                                    })
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-paidAmount">Paid Amount</Label>
                                                            <Input
                                                                id="edit-paidAmount"
                                                                type="number"
                                                                step="0.01"
                                                                value={formData.payment?.paidAmount || 0}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        payment: {
                                                                            ...formData.payment!,
                                                                            paidAmount: Number.parseFloat(e.target.value),
                                                                        },
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-paymentStatus">Payment Status</Label>
                                                            <Select
                                                                value={formData.payment?.paymentStatus || "PENDING"}
                                                                onValueChange={(value) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        payment: {
                                                                            ...formData.payment!,
                                                                            paymentStatus: value as "PENDING" | "PAID" | "FAILED" | "REFUNDED",
                                                                        },
                                                                    })
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                                    <SelectItem value="PAID">Paid</SelectItem>
                                                                    <SelectItem value="FAILED">Failed</SelectItem>
                                                                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="edit-method">Payment Method</Label>
                                                            <Input
                                                                id="edit-method"
                                                                placeholder="e.g., Cash, Card, Online"
                                                                value={formData.payment?.method || ""}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        payment: {
                                                                            ...formData.payment!,
                                                                            method: e.target.value,
                                                                        },
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-base font-semibold">Additional Info</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="edit-status">Status</Label>
                                                            <Select
                                                                value={formData.status}
                                                                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="edit-specialRequest">Special Request</Label>
                                                    <Textarea
                                                        id="edit-specialRequest"
                                                        value={formData.specialRequest}
                                                        onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                                                        placeholder="Any special requests or notes..."
                                                    />
                                                </div>

                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={updateMutation.isPending}>
                                                        {updateMutation.isPending ? "Updating..." : "Update Reservation"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="gap-2"
                                        onClick={() => handleDeleteReservation(reservation.id)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
