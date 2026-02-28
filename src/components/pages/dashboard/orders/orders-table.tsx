import TimeOnly from "@/components/time-only";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderWithItems, useUpdateOrderStatus } from "@/lib/order-queries";
import {
  getNextStatus,
  getPaymentStatusColor,
  getStatusAction,
  getStatusColor,
} from "@/lib/utils";
import { getStatusIcon } from "@/lib/utils-jsx";
import { Restaurant } from "@prisma/client";
import { Check, Eye, X } from "lucide-react";
import OrderDetailsModel from "./order-details-model";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n/routing";

const OrdersTable = ({
  orders: filteredOrders,
  loading: isLoading,
  restaurant,
  setSelectedOrder,
  selectedOrder,
}: {
  orders: OrderWithItems[];
  loading: boolean;
  restaurant: Restaurant;
  setSelectedOrder: (order: OrderWithItems) => void;
  selectedOrder: OrderWithItems | null;
}) => {
  const updateOrderStatus = useUpdateOrderStatus(restaurant?.id);
  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };
  const t = useTranslations("orders.orderTable");
  const locale = useLocale() as Locale;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title", { count: filteredOrders.length })}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid">
        <div className="overflow-x-auto grid">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#EBE3CC]/70">
                <TableHead>{t("headers.orderNumber")}</TableHead>
                <TableHead>{t("headers.customer")}</TableHead>
                <TableHead>{t("headers.type")}</TableHead>
                <TableHead>{t("headers.deliveryTime")}</TableHead>
                <TableHead>{t("headers.status")}</TableHead>
                <TableHead>{t("headers.payment")}</TableHead>
                <TableHead>{t("headers.total")}</TableHead>
                <TableHead>{t("headers.time")}</TableHead>
                <TableHead>{t("headers.actions")}</TableHead>
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
                    {t("noOrders")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-[#EBE3CC]/70">
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
                      <Badge variant="outline" className="capitalize">
                        <TimeOnly
                          iso={order.preferredISO}
                          timeZone={restaurant.timezone || "Europe/Rome"}
                        />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          order.status,
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
                          order.payment_status,
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
                                {t("detailsTitle", {
                                  orderNumber: order.order_number,
                                })}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <OrderDetailsModel order={selectedOrder} />
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
                                  getNextStatus(order.status)!,
                                )
                              }
                              className="bg-main-green text-white cursor-pointer hover:bg-main-green/70 hover:text-white"
                              disabled={updateOrderStatus.isPending}
                            >
                              <Check size={16} />
                              {updateOrderStatus.isPending
                                ? t("buttons.updating")
                                : getStatusAction(order.status, locale)}
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
                              title={t("buttons.cancel")}
                              className="cursor-pointer hover:opacity-70"
                              disabled={updateOrderStatus.isPending}
                            >
                              <X size={16} />
                              {t("buttons.cancel")}
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
  );
};

export default OrdersTable;
