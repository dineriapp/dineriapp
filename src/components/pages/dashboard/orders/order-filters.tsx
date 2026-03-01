import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

type OrderFiltersProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (value: string) => void;
  orderTypeFilter: string;
  setOrderTypeFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
};

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
  const t = useTranslations("orders.filters");
  return (
    <Card>
      <CardContent className="px-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-40 w-full">
                <SelectValue placeholder={t("orderStatus.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("orderStatus.all")}</SelectItem>
                <SelectItem value="pending">
                  {t("orderStatus.pending")}
                </SelectItem>
                <SelectItem value="confirmed">
                  {t("orderStatus.confirmed")}
                </SelectItem>
                <SelectItem value="preparing">
                  {t("orderStatus.preparing")}
                </SelectItem>
                <SelectItem value="ready">{t("orderStatus.ready")}</SelectItem>
                <SelectItem value="delivered">
                  {t("orderStatus.delivered")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t("orderStatus.cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={paymentStatusFilter}
              onValueChange={setPaymentStatusFilter}
            >
              <SelectTrigger className="md:w-40 w-full">
                <SelectValue placeholder={t("paymentStatus.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("paymentStatus.all")}</SelectItem>
                <SelectItem value="completed">
                  {t("paymentStatus.completed")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("paymentStatus.pending")}
                </SelectItem>
                <SelectItem value="failed">
                  {t("paymentStatus.failed")}
                </SelectItem>
                <SelectItem value="refunded">
                  {t("paymentStatus.refunded")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
              <SelectTrigger className="md:w-32 w-full">
                <SelectValue placeholder={t("orderType.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("orderType.all")}</SelectItem>
                <SelectItem value="pickup">{t("orderType.pickup")}</SelectItem>
                <SelectItem value="delivery">
                  {t("orderType.delivery")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="md:w-32 w-full">
                <SelectValue placeholder={t("dateRange.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dateRange.all")}</SelectItem>
                <SelectItem value="today">{t("dateRange.today")}</SelectItem>
                <SelectItem value="week">{t("dateRange.week")}</SelectItem>
                <SelectItem value="month">{t("dateRange.month")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderFilters;
