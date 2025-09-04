import React from 'react'
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

type OrderFiltersProps = {
    searchTerm: string
    setSearchTerm: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    paymentStatusFilter: string
    setPaymentStatusFilter: (value: string) => void
    orderTypeFilter: string
    setOrderTypeFilter: (value: string) => void
    dateFilter: string
    setDateFilter: (value: string) => void
}

const OrderFilters = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    orderTypeFilter,
    setOrderTypeFilter,
    dateFilter,
    setDateFilter,
}: OrderFiltersProps) => {
    return (
        <Card>
            <CardContent className="px-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by order number, customer name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Order Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={paymentStatusFilter}
                            onValueChange={setPaymentStatusFilter}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={orderTypeFilter}
                            onValueChange={setOrderTypeFilter}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Order Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="pickup">Pickup</SelectItem>
                                <SelectItem value="delivery">Delivery</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default OrderFilters
