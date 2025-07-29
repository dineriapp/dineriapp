"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Receipt,
  Navigation,
  DollarSign,
  Package,
  TrendingUp,
  Download,
  RefreshCw,
  AlertCircle,
  Euro,
  Clock4,
} from "lucide-react";
import {
  useOrders,
  useOrderStats,
  useUpdateOrderStatus,
  useRefreshOrders,
  useExportOrders,
  OrderWithItems,
} from "@/lib/order-queries";
import { useRestaurantStore } from "@/stores/restaurant-store";
import Link from "next/link";

export default function OrdersPage() {
  const { selectedRestaurant: restaurant } = useRestaurantStore();

  // TanStack Query hooks
  const {
    data: orders = [],
    isLoading,
    error,
    isRefetching,
  } = useOrders(restaurant?.id);
  const { data: stats, isLoading: statsLoading } = useOrderStats(
    restaurant?.id
  );
  const updateOrderStatus = useUpdateOrderStatus(restaurant?.id);
  const refreshOrders = useRefreshOrders(restaurant?.id);
  const exportOrders = useExportOrders(restaurant?.id);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null
  );

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        order.payment_status === paymentStatusFilter;
      const matchesOrderType =
        orderTypeFilter === "all" || order.order_type === orderTypeFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const orderDate = new Date(order.updatedAt);
        const now = new Date();

        switch (dateFilter) {
          case "today":
            matchesDate = orderDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= monthAgo;
            break;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesOrderType &&
        matchesDate
      );
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentStatusFilter,
    orderTypeFilter,
    dateFilter,
  ]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  const handleRefresh = () => {
    refreshOrders.mutate();
  };

  const handleExport = () => {
    exportOrders.mutate({
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
      orderType: orderTypeFilter,
      dateRange: dateFilter,
      searchTerm,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />;
      case "preparing":
        return <Clock className="h-3 w-3" />;
      case "ready":
        return <CheckCircle className="h-3 w-3" />;
      case "delivered":
        return <Truck className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "delivered";
      default:
        return null;
    }
  };

  const getStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "Confirm Order";
      case "confirmed":
        return "Start Preparing";
      case "preparing":
        return "Mark as Ready";
      case "ready":
        return "Mark as Delivered";
      default:
        return null;
    }
  };

  // Show loading state when menu is being fetched
  if (isLoading || !restaurant) {
    return (
      <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
        <div className="flex items-center space-x-2 text-slate-500">
          <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full" />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto py-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all your restaurant orders
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load orders
            </h3>
            <p className="text-gray-600 text-center mb-4">{error.message}</p>
            <Button onClick={handleRefresh} disabled={refreshOrders.isPending}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your restaurant orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefetching || refreshOrders.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Link
            href={"/dashboard/settings/hours"}
            className="flex items-center justify-between w-full h-full"
          >
            <Button variant="outline">
              <Clock4 className="h-4 w-4 mr-2" />
              Change Timeline{" "}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportOrders.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportOrders.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.today_orders} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{stats.total_revenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  €{stats.today_revenue.toFixed(2)} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_orders}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{stats.average_order_value.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Per order</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Manage your restaurant orders and update their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No orders found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.order_number.split("-").slice(-1)[0]}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">
                            {order.customer_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {order.order_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getPaymentStatusColor(
                            order.payment_status
                          )} w-fit`}
                        >
                          {order.payment_status.charAt(0).toUpperCase() +
                            order.payment_status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        €{order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Order Details - {order.order_number}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <OrderDetailsModal order={selectedOrder} />
                              )}
                            </DialogContent>
                          </Dialog>

                          {getNextStatus(order.status) &&
                            order.status !== "cancelled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(
                                    order.id,
                                    getNextStatus(order.status)!
                                  )
                                }
                                disabled={updateOrderStatus.isPending}
                              >
                                {updateOrderStatus.isPending
                                  ? "Updating..."
                                  : getStatusAction(order.status)}
                              </Button>
                            )}

                          {order.status !== "cancelled" &&
                            order.status !== "delivered" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "cancelled")
                                }
                                disabled={updateOrderStatus.isPending}
                              >
                                Cancel
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderDetailsModal({ order }: { order: OrderWithItems }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "preparing":
        return <Clock className="h-4 w-4" />;
      case "ready":
        return <CheckCircle className="h-4 w-4" />;
      case "delivered":
        return <Truck className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Order Status</h3>
          <p className="text-sm text-gray-500">
            Created {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge
          className={`${getStatusColor(order.status)} flex items-center gap-1`}
        >
          {getStatusIcon(order.status)}
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{order.customer_email}</span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{order.customer_phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Order Type</p>
              <Badge variant="outline" className="capitalize">
                {order.order_type}
              </Badge>
            </div>
            {order.estimated_ready_time && (
              <div>
                <p className="text-sm text-gray-600">Estimated Ready Time</p>
                <p className="text-sm font-medium">
                  {new Date(order.estimated_ready_time).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delivery Information */}
      {order.order_type === "delivery" && order.delivery_address && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Full Address</p>
              <p className="text-sm font-medium">{order.delivery_address}</p>
            </div>

            {order.street && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Street</p>
                  <p className="font-medium">{order.street}</p>
                </div>
                <div>
                  <p className="text-gray-600">City</p>
                  <p className="font-medium">{order.city}</p>
                </div>
                <div>
                  <p className="text-gray-600">State</p>
                  <p className="font-medium">{order.state}</p>
                </div>
                <div>
                  <p className="text-gray-600">ZIP Code</p>
                  <p className="font-medium">{order.postal_code}</p>
                </div>
              </div>
            )}

            {order.latitude && order.longitude && (
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">GPS Coordinates</p>
                  <p className="text-sm font-medium">
                    {order.latitude.toFixed(6)}, {order.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            {order.notes && (
              <div>
                <p className="text-sm text-gray-600">Delivery Notes</p>
                <p className="text-sm font-medium">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b pb-3 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                  {item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.allergens.map((allergen) => (
                        <Badge
                          key={allergen}
                          variant="secondary"
                          className="text-xs"
                        >
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.special_requests && (
                    <p className="text-sm text-blue-600 mt-1">
                      Special: {item.special_requests}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    €{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{item.item_total.toFixed(2)}</p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>€{order.tax_amount.toFixed(2)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>€{order.delivery_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>€{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      {order.special_instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{order.special_instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Payment Status</span>
            <Badge
              className={`${
                order.payment_status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.payment_status.charAt(0).toUpperCase() +
                order.payment_status.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
