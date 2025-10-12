'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarCheck2, Clock, XCircle, Users, LayoutGrid, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from '@/components/ui/button'

const ReservationsPage = () => {
    // 🧪 Dummy data (replace with Supabase or API data)
    const reservations = [
        {
            id: "1",
            name: "John Doe",
            date: "2025-10-20",
            fromTime: "07:00 PM",
            toTime: "09:00 PM",
            partySize: 4,
            status: "CONFIRMED",
            paymentStatus: "PAID",
            source: "ONLINE",
        },
        {
            id: "2",
            name: "Emma Watson",
            date: "2025-10-21",
            fromTime: "08:00 PM",
            toTime: "10:00 PM",
            partySize: 2,
            status: "PENDING",
            paymentStatus: "PENDING",
            source: "PHONE",
        },
        {
            id: "3",
            name: "Liam Smith",
            date: "2025-10-22",
            fromTime: "06:00 PM",
            toTime: "08:00 PM",
            partySize: 6,
            status: "CANCELLED",
            paymentStatus: "REFUNDED",
            source: "ONLINE",
        },
        {
            id: "4",
            name: "Sophia Lee",
            date: "2025-10-23",
            fromTime: "05:00 PM",
            toTime: "07:00 PM",
            partySize: 3,
            status: "CONFIRMED",
            paymentStatus: "PAID",
            source: "WALK_IN",
        },
        {
            id: "5",
            name: "Michael Brown",
            date: "2025-10-24",
            fromTime: "09:00 PM",
            toTime: "11:00 PM",
            partySize: 5,
            status: "CONFIRMED",
            paymentStatus: "PAID",
            source: "PARTNER",
        },
        {
            id: "6",
            name: "Ava Taylor",
            date: "2025-10-25",
            fromTime: "06:30 PM",
            toTime: "08:30 PM",
            partySize: 2,
            status: "PENDING",
            paymentStatus: "PENDING",
            source: "ONLINE",
        },
        {
            id: "7",
            name: "Noah Wilson",
            date: "2025-10-26",
            fromTime: "07:30 PM",
            toTime: "09:30 PM",
            partySize: 8,
            status: "CONFIRMED",
            paymentStatus: "PAID",
            source: "PHONE",
        },
        {
            id: "8",
            name: "Olivia Johnson",
            date: "2025-10-27",
            fromTime: "04:00 PM",
            toTime: "06:00 PM",
            partySize: 1,
            status: "CANCELLED",
            paymentStatus: "FAILED",
            source: "ONLINE",
        },
        {
            id: "9",
            name: "Ethan Miller",
            date: "2025-10-28",
            fromTime: "05:30 PM",
            toTime: "07:30 PM",
            partySize: 3,
            status: "PENDING",
            paymentStatus: "PENDING",
            source: "PARTNER",
        },
        {
            id: "10",
            name: "Isabella Garcia",
            date: "2025-10-29",
            fromTime: "06:00 PM",
            toTime: "08:00 PM",
            partySize: 4,
            status: "CONFIRMED",
            paymentStatus: "PAID",
            source: "WALK_IN",
        },
        {
            id: "11",
            name: "James Anderson",
            date: "2025-10-30",
            fromTime: "07:00 PM",
            toTime: "09:00 PM",
            partySize: 6,
            status: "CONFIRMED",
            paymentStatus: "PAID",
            source: "ONLINE",
        },
        {
            id: "12",
            name: "Mia Davis",
            date: "2025-10-31",
            fromTime: "08:00 PM",
            toTime: "10:00 PM",
            partySize: 2,
            status: "CANCELLED",
            paymentStatus: "REFUNDED",
            source: "PHONE",
        },
        {
            id: "13",
            name: "William Martinez",
            date: "2025-11-01",
            fromTime: "09:30 PM",
            toTime: "11:30 PM",
            partySize: 10,
            status: "PENDING",
            paymentStatus: "PENDING",
            source: "PARTNER",
        },
    ]

    // 📊 Stats
    const total = reservations.length
    const confirmed = reservations.filter(r => r.status === "CONFIRMED").length
    const pending = reservations.filter(r => r.status === "PENDING").length
    const cancelled = reservations.filter(r => r.status === "CANCELLED").length
    const totalTables = 20

    // ✨ Helper for stats card
    const StatCard = ({ icon: Icon, title, value, description, color }: any) => (
        <Card className="flex items-start !gap-0 flex-col p-4 hover:shadow-md transition">
            <div
                className={`p-3 rounded-full ${color} bg-opacity-10`}
            >
                <Icon className={`w-6 h-6 ${color.replace('text-', 'stroke-')}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h2 className="text-2xl font-bold">{value}</h2>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
        </Card>
    )

    return (
        <div className="p-6 space-y-6">
            {/* 🧭 Stats Overview */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Reservations Dashboard</h1>
                <p className="text-muted-foreground text-sm mb-4">
                    Quick overview of all reservations and table availability.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        icon={Users}
                        title="Total Reservations"
                        value={total}
                        description="All time bookings"
                        color="text-blue-600"
                    />
                    <StatCard
                        icon={CalendarCheck2}
                        title="Confirmed"
                        value={confirmed}
                        description="Approved reservations"
                        color="text-green-600"
                    />
                    <StatCard
                        icon={Clock}
                        title="Pending"
                        value={pending}
                        description="Awaiting confirmation"
                        color="text-yellow-600"
                    />
                    <StatCard
                        icon={XCircle}
                        title="Cancelled"
                        value={cancelled}
                        description="Cancelled bookings"
                        color="text-red-600"
                    />
                    <StatCard
                        icon={LayoutGrid}
                        title="Total Tables"
                        value={totalTables}
                        description="Available tables"
                        color="text-indigo-600"
                    />
                </div>
            </div>

            {/* 📊 Reservation Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Reservations</CardTitle>
                    <CardDescription>View and manage upcoming reservations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Party Size</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.map((res) => (
                                <TableRow key={res.id}>
                                    <TableCell>{res.name}</TableCell>
                                    <TableCell>{res.date}</TableCell>
                                    <TableCell>{res.fromTime} - {res.toTime}</TableCell>
                                    <TableCell>{res.partySize}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                                            {res.source}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${res.paymentStatus === "PAID"
                                                    ? "bg-green-100 text-green-700"
                                                    : res.paymentStatus === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : res.paymentStatus === "FAILED"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {res.paymentStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${res.status === "CONFIRMED"
                                                    ? "bg-green-100 text-green-700"
                                                    : res.status === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {res.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Button size="icon" variant="ghost" title="View">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" title="Edit">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" title="Delete" className="text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default ReservationsPage
