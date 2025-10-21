"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    DollarSign,
    Filter,
    ReceiptText,
    RefreshCcw,
    Download,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// 🧾 Dummy Payment Data
const dummyPayments = [
    {
        id: "1",
        reservationId: "1001",
        amount: 85.5,
        currency: "EUR",
        paymentStatus: "PAID",
        transactionId: "TX-98412",
        method: "Credit Card",
        paidAt: new Date(2025, 9, 10),
    },
    {
        id: "2",
        reservationId: "1002",
        amount: 45.0,
        currency: "EUR",
        paymentStatus: "PENDING",
        transactionId: "TX-23892",
        method: "Cash",
        paidAt: null,
    },
    {
        id: "3",
        reservationId: "1003",
        amount: 100.0,
        currency: "EUR",
        paymentStatus: "PAID",
        transactionId: "TX-56382",
        method: "Credit Card",
        paidAt: new Date(2025, 9, 1),
    },
    {
        id: "4",
        reservationId: "1004",
        amount: 55.5,
        currency: "EUR",
        paymentStatus: "REFUNDED",
        transactionId: "TX-28934",
        method: "Credit Card",
        paidAt: new Date(2025, 8, 28),
    },
    {
        id: "5",
        reservationId: "1005",
        amount: 72.0,
        currency: "EUR",
        paymentStatus: "FAILED",
        transactionId: "TX-99231",
        method: "Credit Card",
        paidAt: null,
    },
    {
        id: "6",
        reservationId: "1006",
        amount: 220.0,
        currency: "EUR",
        paymentStatus: "PAID",
        transactionId: "TX-00231",
        method: "Cash",
        paidAt: new Date(2025, 9, 19),
    },
    {
        id: "7",
        reservationId: "1007",
        amount: 120.0,
        currency: "EUR",
        paymentStatus: "PAID",
        transactionId: "TX-33212",
        method: "Credit Card",
        paidAt: new Date(2025, 8, 15),
    },
]

// 🪙 Helper: get current month stats
function getRevenueStats(payments: typeof dummyPayments) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const lastMonth = currentMonth - 1

    const thisMonthRevenue = payments
        .filter((p) => p.paidAt && p.paidAt.getMonth() === currentMonth && p.paymentStatus === "PAID")
        .reduce((sum, p) => sum + p.amount, 0)

    const lastMonthRevenue = payments
        .filter((p) => p.paidAt && p.paidAt.getMonth() === lastMonth && p.paymentStatus === "PAID")
        .reduce((sum, p) => sum + p.amount, 0)

    return {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        totalTransactions: payments.length,
        paid: payments.filter((p) => p.paymentStatus === "PAID").length,
        pending: payments.filter((p) => p.paymentStatus === "PENDING").length,
        refunded: payments.filter((p) => p.paymentStatus === "REFUNDED").length,
    }
}

export default function PaymentsPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [payments] = useState(dummyPayments)

    const stats = getRevenueStats(payments)

    const filteredPayments = payments.filter((p) => {
        const matchSearch =
            p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
            p.reservationId.toLowerCase().includes(search.toLowerCase())

        const matchStatus = statusFilter === "ALL" || p.paymentStatus === statusFilter

        return matchSearch && matchStatus
    })

    const StatCard = ({
        title,
        value,
        icon,
        trend,
    }: {
        title: string
        value: string | number
        icon: React.ReactNode
        trend?: number
    }) => {
        const isPositive = trend !== undefined && trend >= 0
        return (
            <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        {icon} {title}
                    </CardTitle>
                    {trend !== undefined && (
                        <span
                            className={`flex items-center text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {isPositive ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{value}</p>
                </CardContent>
            </Card>
        )
    }

    // 🔢 Calculate % growth trend for this month vs last month
    const growth =
        stats.lastMonth > 0
            ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
            : stats.thisMonth > 0
                ? 100
                : 0

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Payments & Revenue</h2>
                <p className="text-slate-600 mt-1">
                    View payment transactions and track your restaurant revenue
                </p>
            </div>

            {/* 📊 Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Revenue This Month"
                    value={`€${stats.thisMonth.toFixed(2)}`}
                    icon={<DollarSign className="h-5 w-5 text-gray-400" />}
                    trend={growth}
                />
                <StatCard
                    title="Last Month Revenue"
                    value={`€${stats.lastMonth.toFixed(2)}`}
                    icon={<Banknote className="h-5 w-5 text-gray-400" />}
                />
                <StatCard
                    title="Paid Transactions"
                    value={stats.paid}
                    icon={<ReceiptText className="h-5 w-5 text-gray-400" />}
                />
                <StatCard
                    title="Pending/Refunded"
                    value={`${stats.pending} / ${stats.refunded}`}
                    icon={<Filter className="h-5 w-5 text-gray-400" />}
                />
            </div>

            {/* 🔍 Filters */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search transaction or reservation ID"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="!bg-white w-[300px]"
                    />

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] !bg-white">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="flex !bg-white items-center gap-2">
                        <RefreshCcw className="h-4 w-4" /> Refresh
                    </Button>
                </div>

                <Button className="bg-black !text-white hover:bg-gray-800 flex items-center gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* 💳 Payments Table */}
            <div className="bg-white border rounded-md shadow-sm overflow-hidden p-5">
                <Table>
                    <TableHeader>
                        <TableRow className="">
                            <TableHead className="py-3">ID</TableHead>
                            <TableHead>Reservation</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Paid At</TableHead>
                            <TableHead>Transaction ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell>{p.reservationId}</TableCell>
                                    <TableCell>
                                        €{p.amount.toFixed(2)} {p.currency}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                p.paymentStatus === "PAID"
                                                    ? "bg-green-100 text-green-700"
                                                    : p.paymentStatus === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : p.paymentStatus === "FAILED"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-blue-100 text-blue-700"
                                            }
                                        >
                                            {p.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{p.method}</TableCell>
                                    <TableCell>
                                        {p.paidAt ? format(p.paidAt, "dd MMM yyyy") : "-"}
                                    </TableCell>
                                    <TableCell>{p.transactionId}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
