"use client"

import LoadingUI from "@/components/loading-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { useReservationsPayments } from "@/lib/reservation-queries"
import { ReservationPayment } from "@/lib/types"
import { formatDateTime } from "@/lib/utils"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { format } from "date-fns"
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    DollarSign,
    Download,
    Filter,
    ReceiptText,
    RefreshCcw,
} from "lucide-react"
import { useState } from "react"

// 🪙 Helper: get current month stats
function getRevenueStats(payments: ReservationPayment[]) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calculate last month properly (handles year change)
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const lastMonth = lastMonthDate.getMonth()
    const lastMonthYear = lastMonthDate.getFullYear()

    const thisMonthRevenue = payments
        .filter((p) => {
            if (!p.paid_at || p.status !== "PAID") return false
            const paidAt = new Date(p.paid_at)
            return paidAt.getMonth() === currentMonth &&
                paidAt.getFullYear() === currentYear
        })
        .reduce((sum, p) => sum + Number(p.amount), 0)

    const lastMonthRevenue = payments
        .filter((p) => {
            if (!p.paid_at || p.status !== "PAID") return false
            const paidAt = new Date(p.paid_at)
            return paidAt.getMonth() === lastMonth &&
                paidAt.getFullYear() === lastMonthYear
        })
        .reduce((sum, p) => sum + Number(p.amount), 0)

    return {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        totalTransactions: payments.length,
        paid: payments.filter((p) => p.status === "PAID").length,
        pending: payments.filter((p) => p.status === "PENDING").length,
        refunded: payments.filter((p) => p.status === "REFUNDED").length,
        failed: payments.filter((p) => p.status === "FAILED").length,
    }
}

// 📊 Stat Card Component (moved outside to prevent re-renders)
const StatCard = ({
    title,
    value,
    icon,
    trend,
    description,
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: number
    description?: string
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
                {description && (
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    )
}

export default function PaymentsPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const { selectedRestaurant: restaurant } = useRestaurantStore()
    const restaurantId = restaurant?.id

    const {
        data: payments = [],
        isLoading,
        error,
        refetch
    } = useReservationsPayments(restaurantId)

    const stats = getRevenueStats(payments)

    const filteredPayments = payments.filter((p) => {
        const matchSearch =
            p?.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
            p.reservation_id.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase())

        const matchStatus = statusFilter === "ALL" || p.status === statusFilter

        return matchSearch && matchStatus
    })

    // 🔢 Calculate % growth trend for this month vs last month
    const growth = stats.lastMonth > 0
        ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
        : stats.thisMonth > 0
            ? 100
            : 0

    const handleExportCSV = () => {
        // Basic CSV export implementation
        const headers = ['ID', 'Reservation ID', 'Amount', 'Currency', 'Status', 'Payment Method', 'Paid At', 'Transaction ID']
        const csvData = filteredPayments.map(p => [
            p.id,
            p.reservation_id,
            p.amount,
            p.currency,
            p.status,
            p.payment_method || 'N/A',
            p.paid_at ? format(new Date(p.paid_at), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
            p.transaction_id || 'N/A'
        ])

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleRefresh = () => {
        refetch()
    }

    if (isLoading || !restaurant) {
        return <LoadingUI text="Loading payments..." />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load payments</p>
                    <Button onClick={handleRefresh} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "PAID":
                return "bg-green-100 text-green-700 border-green-200"
            case "PENDING":
                return "bg-yellow-100 text-yellow-700 border-yellow-200"
            case "FAILED":
                return "bg-red-100 text-red-700 border-red-200"
            case "REFUNDED":
                return "bg-blue-100 text-blue-700 border-blue-200"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    const formatAmount = (payment: ReservationPayment) => {
        const amount = Number(payment.amount).toFixed(2)
        return `${payment.currency} ${amount}`
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Payments & Revenue</h1>
                <p className="text-slate-600 mt-1">
                    View payment transactions and track your restaurant revenue
                </p>
            </div>

            {/* 📊 Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="This Month"
                    value={`€${stats.thisMonth.toFixed(2)}`}
                    icon={<DollarSign className="h-5 w-5 text-gray-400" />}
                    trend={growth}
                    description="vs last month"
                />
                <StatCard
                    title="Last Month "
                    value={`€${stats.lastMonth.toFixed(2)}`}
                    icon={<Banknote className="h-5 w-5 text-gray-400" />}
                />
                <StatCard
                    title="Paid Transactions"
                    value={stats.paid}
                    icon={<ReceiptText className="h-5 w-5 text-gray-400" />}
                    description={`${stats.totalTransactions} total`}
                />
                <StatCard
                    title="Pending/Failed"
                    value={`${stats.pending} / ${stats.failed}`}
                    icon={<Filter className="h-5 w-5 text-gray-400" />}
                    description={`${stats.refunded} refunded`}
                />
            </div>

            {/* 🔍 Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <Input
                        placeholder="Search by ID, transaction, or reservation"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="!bg-white w-full sm:w-[300px]"
                        aria-label="Search payments"
                    />

                    <div className="flex items-center gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] !bg-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                                <SelectItem value="REFUNDED">Refunded</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            className="flex !bg-white items-center gap-2"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <Button
                    className="bg-black !text-white hover:bg-gray-800 flex items-center gap-2 w-full sm:w-auto"
                    onClick={handleExportCSV}
                    disabled={filteredPayments.length === 0}
                >
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* 💳 Payments Table */}
            <div className="bg-white border rounded-md shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">
                        Transactions ({filteredPayments.length})
                    </h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Payment ID</TableHead>
                            <TableHead className="w-[120px]">Reservation ID</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Paid At</TableHead>
                            <TableHead>Transaction ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                                <TableRow key={payment.id} className="hover:bg-gray-50">
                                    <TableCell className="font-mono text-xs">
                                        {payment.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {payment.reservation_id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatAmount(payment)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getStatusBadgeVariant(payment.status)}
                                        >
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {payment.payment_method || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {payment.paid_at ? formatDateTime(payment.paid_at, restaurant.timezone || undefined) : "-"}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {payment.transaction_id || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    {payments.length === 0 ?
                                        "No payment transactions found." :
                                        "No transactions match your filters."
                                    }
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}