"use client";

import LoadingUI from "@/components/loading-ui";
import OrderFilters from "@/components/pages/dashboard/orders/order-filters";
import OrdersTable from "@/components/pages/dashboard/orders/orders-table";
import { RefreshIntervalSelect } from "@/components/pages/dashboard/orders/refresh-interval-select";
import RestaurantOperationalSettingsCard from "@/components/restaurant-operational-settings-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrderWithItems,
  useExportOrders,
  useOrders,
  useOrderStats,
  useRefreshOrders,
} from "@/lib/order-queries";
import { useRestaurantStore } from "@/stores/restaurant-store";
import {
  AlertCircle,
  Clock,
  Clock4,
  Download,
  Euro,
  Package,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";

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
    restaurant?.id,
  );
  const refreshOrders = useRefreshOrders(restaurant?.id);
  const exportOrders = useExportOrders(restaurant?.id);
  const t = useTranslations("orders");
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [refreshSeconds, setRefreshSeconds] = useState(() => {
    const saved = localStorage.getItem("refreshSeconds");
    return saved ? Number(saved) : 120; // default 4 seconds
  });

  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null,
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

  const handleRefreshChange = (value: number) => {
    setRefreshSeconds(value);
    localStorage.setItem("refreshSeconds", String(value));
  };

  useEffect(() => {
    if (refreshSeconds <= 0) return; // 0 means no  //

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshSeconds * 1000);

    return () => clearInterval(interval);
  }, [refreshSeconds]);

  // Show loading state when menu is being fetched
  if (isLoading || !restaurant) {
    return <LoadingUI text={t("loading")} />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto py-16">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("error.failed")}
            </h3>
            <p className="text-gray-600 text-center mb-4">{error.message}</p>
            <Button onClick={handleRefresh} disabled={refreshOrders.isPending}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("error.tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-1 flex-wrap ">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefetching || refreshOrders.isPending}
          >
            <RefreshCw
              className={`h-4 w-4  ${isRefetching ? "animate-spin" : ""}`}
            />
            {t("buttons.refresh")}
          </Button>
          <RefreshIntervalSelect
            refreshSeconds={refreshSeconds}
            handleRefreshChange={handleRefreshChange}
          />
          <Link
            href={"/dashboard/settings/hours"}
            className="flex items-center justify-between w-max h-full"
          >
            <Button variant="outline">
              <Clock4 className="h-4 w-4 " />
              {t("buttons.changeTimeline")}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportOrders.isPending}
          >
            <Download className="h-4 w-4 " />
            {exportOrders.isPending
              ? t("buttons.exporting")
              : t("buttons.export")}
          </Button>
        </div>
      </div>
      <RestaurantOperationalSettingsCard />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4">
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
            <Card className="box-shad-every-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("stats.totalOrders")}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.todayOrders", { count: stats.today_orders })}
                </p>
              </CardContent>
            </Card>

            <Card className="box-shad-every-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("stats.totalRevenue")}
                </CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{stats.total_revenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.todayRevenue", {
                    amount: stats.today_revenue.toFixed(2),
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className="box-shad-every-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("stats.pendingOrders")}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.needAttention")}
                </p>
              </CardContent>
            </Card>

            <Card className="box-shad-every-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("stats.avgOrderValue")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{stats.average_order_value.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.perOrder")}
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        orderTypeFilter={orderTypeFilter}
        setOrderTypeFilter={setOrderTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      {/* Orders Table */}

      <OrdersTable
        loading={isLoading}
        orders={filteredOrders}
        restaurant={restaurant}
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
      />
    </div>
  );
}
