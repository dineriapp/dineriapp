import { Order, OrderItem } from "@prisma/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type OrderWithItems = Order & {
    items: OrderItem[]
}

interface OrderStats {
    total_orders: number
    total_revenue: number
    pending_orders: number
    completed_orders: number
    average_order_value: number
    today_orders: number
    today_revenue: number
    this_week_orders: number
    this_week_revenue: number
    this_month_orders: number
    this_month_revenue: number
}

// Orders queries
export function useOrders(restaurantId?: string) {
    return useQuery({
        queryKey: ["orders", restaurantId],
        queryFn: async () => {
            if (!restaurantId) throw new Error("Restaurant ID is required")

            const response = await fetch(`/api/restaurants/${restaurantId}/orders`)
            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch orders")
            }

            return data.data as OrderWithItems[]
        },
        enabled: !!restaurantId,
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
        staleTime: 10000, // Consider data stale after 10 seconds
    })
}

export function useOrderStats(restaurantId?: string) {
    return useQuery({
        queryKey: ["order-stats", restaurantId],
        queryFn: async () => {
            if (!restaurantId) throw new Error("Restaurant ID is required")

            const response = await fetch(`/api/restaurants/${restaurantId}/orders/stats`)
            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch order stats")
            }

            return data.data as OrderStats
        },
        enabled: !!restaurantId,
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000, // Consider data stale after 30 seconds
    })
}

// Order mutations
export function useUpdateOrderStatus(restaurantId?: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to update order status")
            }

            return data.data
        },
        onMutate: async ({ orderId, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["orders", restaurantId] })

            // Snapshot the previous value
            const previousOrders = queryClient.getQueryData<OrderWithItems[]>(["orders", restaurantId])

            // Optimistically update the order status
            if (previousOrders) {
                queryClient.setQueryData<OrderWithItems[]>(
                    ["orders", restaurantId],
                    (old) => old?.map((order) => (order.id === orderId ? { ...order, status: status as any } : order)) || [],
                )
            }

            return { previousOrders }
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousOrders) {
                queryClient.setQueryData(["orders", restaurantId], context.previousOrders)
            }
            toast.error(error.message)
        },
        onSuccess: (data, { status }) => {
            toast.success(`Order marked as ${status}`)
            // Invalidate and refetch both orders and stats
            queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] })
            queryClient.invalidateQueries({ queryKey: ["order-stats", restaurantId] })
        },
    })
}

export function useRefreshOrders(restaurantId?: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            // This doesn't actually call an API, just triggers a refetch
            await queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] })
            await queryClient.invalidateQueries({ queryKey: ["order-stats", restaurantId] })
        },
        onSuccess: () => {
            toast.success("Orders refreshed")
        },
        onError: () => {
            toast.error("Failed to refresh orders")
        },
    })
}

// Export order data
export function useExportOrders(restaurantId?: string) {
    return useMutation({
        mutationFn: async (filters?: {
            status?: string
            paymentStatus?: string
            orderType?: string
            dateRange?: string
            searchTerm?: string
        }) => {
            const params = new URLSearchParams()
            if (filters?.status && filters.status !== "all") params.append("status", filters.status)
            if (filters?.paymentStatus && filters.paymentStatus !== "all")
                params.append("paymentStatus", filters.paymentStatus)
            if (filters?.orderType && filters.orderType !== "all") params.append("orderType", filters.orderType)
            if (filters?.dateRange && filters.dateRange !== "all") params.append("dateRange", filters.dateRange)
            if (filters?.searchTerm) params.append("search", filters.searchTerm)

            const response = await fetch(`/api/restaurants/${restaurantId}/orders/export?${params}`)

            if (!response.ok) {
                throw new Error("Failed to export orders")
            }

            // Create download link
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        },
        onSuccess: () => {
            toast.success("Orders exported successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
