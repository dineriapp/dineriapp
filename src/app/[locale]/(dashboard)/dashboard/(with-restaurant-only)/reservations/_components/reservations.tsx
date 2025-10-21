"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowDownRight, ArrowUpRight, Users, Clock, CheckCircle, XCircle } from "lucide-react"

// 🧾 Dummy data
const dummyReservations = [
    {
        id: "1",
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "123456789",
        date: "2025-10-21",
        fromTime: "18:00",
        toTime: "20:00",
        partySize: 2,
        preferredArea: "Patio",
        specialRequest: "Window seat",
        status: "PENDING",
    },
    {
        id: "2",
        name: "John Doe",
        email: "john@example.com",
        phone: "987654321",
        date: "2025-10-21",
        fromTime: "19:00",
        toTime: "21:00",
        partySize: 4,
        preferredArea: "Main Hall",
        specialRequest: "Birthday",
        status: "CONFIRMED",
    },
    {
        id: "3",
        name: "Sarah Smith",
        email: "sarah@example.com",
        phone: "555555555",
        date: "2025-10-21",
        fromTime: "17:00",
        toTime: "18:30",
        partySize: 3,
        preferredArea: "Bar",
        specialRequest: "",
        status: "CANCELLED",
    },
]

type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED"

export default function ReservationsPage() {
    const [reservations, setReservations] = useState(dummyReservations)
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [search, setSearch] = useState("")

    // 📊 Stats
    const totalPending = reservations.filter(r => r.status === "PENDING").length
    const totalConfirmed = reservations.filter(r => r.status === "CONFIRMED").length
    const totalCancelled = reservations.filter(r => r.status === "CANCELLED").length
    const totalGuests = reservations.reduce((sum, r) => sum + r.partySize, 0)

    // 🔢 Dummy trend values (could be calculated from previous data)
    const trend = {
        pending: -5,
        confirmed: 10,
        cancelled: 2,
        guests: 8,
    }

    const filtered = reservations.filter((r) => {
        const matchStatus = statusFilter === "ALL" || r.status === statusFilter
        const matchSearch =
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.email.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    const updateStatus = (id: string, newStatus: ReservationStatus) => {
        const updated = reservations.map((r) =>
            r.id === id ? { ...r, status: newStatus } : r
        )
        setReservations(updated)
    }

    const StatCard = ({
        title,
        value,
        icon,
        trendValue,
    }: {
        title: string
        value: number
        icon: React.ReactNode
        trendValue: number
    }) => {
        const isPositive = trendValue >= 0
        return (
            <Card className="bg-white border">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        {icon} {title}
                    </CardTitle>
                    <span
                        className={`flex items-center text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {isPositive ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(trendValue)}%
                    </span>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{value}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Reservations</h2>
                <p className="text-slate-600 mt-1">Manage all your restaurant bookings</p>
            </div>
            {/* --- Stats --- */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Pending"
                    value={totalPending}
                    icon={<Clock className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.pending}
                />
                <StatCard
                    title="Confirmed"
                    value={totalConfirmed}
                    icon={<CheckCircle className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.confirmed}
                />
                <StatCard
                    title="Cancelled"
                    value={totalCancelled}
                    icon={<XCircle className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.cancelled}
                />
                <StatCard
                    title="Guests"
                    value={totalGuests}
                    icon={<Users className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.guests}
                />
            </div>

            {/* --- Filters --- */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] !bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[250px] !bg-white"
                    />
                </div>

                <Button className="bg-main-green text-white hover:bg-main-green/80 cursor-pointer">
                    + Add Reservation
                </Button>

            </div>

            {/* --- Table --- */}
            <div className="border rounded-lg overflow-hidden bg-white p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{r.name}</TableCell>
                                <TableCell>{r.email}</TableCell>
                                <TableCell>{r.date}</TableCell>
                                <TableCell>
                                    {r.fromTime} - {r.toTime}
                                </TableCell>
                                <TableCell>{r.partySize}</TableCell>
                                <TableCell>{r.preferredArea}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            r.status === "PENDING"
                                                ? "secondary"
                                                : r.status === "CONFIRMED"
                                                    ? "default"
                                                    : "destructive"
                                        }
                                    >
                                        {r.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={r.status}
                                        onValueChange={(val) => updateStatus(r.id, val as ReservationStatus)}
                                    >
                                        <SelectTrigger className="w-[120px] bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filtered.length === 0 && (
                    <div className="p-6 text-center text-sm text-gray-500">
                        No reservations found.
                    </div>
                )}
            </div>
        </div>
    )
}
