"use client";

import type React from "react";

import LoadingUI from "@/components/loading-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAreas } from "@/lib/area-queries";
import {
  useCreateTable,
  useDeleteTable,
  useTables,
  useUpdateTable,
} from "@/lib/table-queries";
import type { CreateTableInput } from "@/lib/types";
import { useRestaurantStore } from "@/stores/restaurant-store";
import {
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export default function TablesGridPage() {
  const { selectedRestaurant: restaurant } = useRestaurantStore();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const t = useTranslations("reservationTablesPage");
  const { data: tables = [], isLoading, error } = useTables(restaurant?.id);
  const { data: areas = [] } = useAreas(restaurant?.id);
  const createTableMutation = useCreateTable(restaurant?.id);
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();

  const [newTable, setNewTable] = useState<CreateTableInput>({
    tableNumber: "",
    capacity: 1,
    areaId: "",
    status: "ACTIVE",
  });

  // 📊 Stats
  const totalTables = tables.length;
  const totalActive = tables.filter((t) => t.status === "ACTIVE").length;
  const totalInactive = tables.filter((t) => t.status === "INACTIVE").length;
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  const trend = {
    total: 5,
    active: 10,
    inactive: -2,
    capacity: 8,
  };

  const filteredTables = tables.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchSearch =
      t.table_number.toLowerCase().includes(search.toLowerCase()) ||
      t.area.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const toggleStatus = (tableId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateTableMutation.mutate({
      tableId,
      data: { status: newStatus as "ACTIVE" | "INACTIVE" },
    });
  };

  const handleAddTable = () => {
    if (!newTable.tableNumber || !newTable.areaId || newTable.capacity <= 0) {
      toast.warning(t("alerts.fillAllFields"));
      return;
    }

    createTableMutation.mutate(newTable, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewTable({
          tableNumber: "",
          capacity: 1,
          areaId: "",
          status: "ACTIVE",
        });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create table")
      },
    });
  };

  const handleDelete = (tableId: string) => {
    if (confirm(t("confirm"))) {
      deleteTableMutation.mutate(tableId);
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    // trendValue,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    trendValue: number;
  }) => {
    // const isPositive = trendValue >= 0
    return (
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {icon} {title}
          </CardTitle>
          {/* <span className={`flex items-center text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                        {Math.abs(trendValue)}%
                    </span> */}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    );
  };

  if (!restaurant) {
    return <LoadingUI text={t("loading.generic")} />;
  }

  if (isLoading) {
    return <LoadingUI text={t("loading.tables")} />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t("title")}</h2>
          <p className="text-slate-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="text-center text-red-500">
          {t("error.loadingTables")} {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t("title")}</h2>
        <p className="text-slate-600 mt-1">{t("subtitle")}</p>
      </div>
      {/* --- Stats --- */}
      <div className="grid md:grid-cols-2 900:grid-cols-4 gap-4">
        <StatCard
          title={t("stats.totalTables")}
          value={totalTables}
          icon={<Users className="h-5 w-5 text-gray-400" />}
          trendValue={trend.total}
        />
        <StatCard
          title={t("stats.active")}
          value={totalActive}
          icon={<ToggleRight className="h-5 w-5 text-gray-400" />}
          trendValue={trend.active}
        />
        <StatCard
          title={t("stats.inactive")}
          value={totalInactive}
          icon={<ToggleLeft className="h-5 w-5 text-gray-400" />}
          trendValue={trend.inactive}
        />
        <StatCard
          title={t("stats.totalCapacity")}
          value={totalCapacity}
          icon={<PlusCircle className="h-5 w-5 text-gray-400" />}
          trendValue={trend.capacity}
        />
      </div>

      {/* --- Filters --- */}
      <div className="flex justify-between flex-wrap items-center gap-4">
        <div className="flex gap-2 max-md:flex-col max-md:w-full ">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-[150px] w-full h-11! !bg-white">
              <SelectValue placeholder={t("filters.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("filters.statusOptions.all")}
              </SelectItem>
              <SelectItem value="ACTIVE">
                {t("filters.statusOptions.active")}
              </SelectItem>
              <SelectItem value="INACTIVE">
                {t("filters.statusOptions.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-[250px] w-full !bg-white h-11!"
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-main-green h-11! max-md:w-full text-white hover:bg-main-green/80 cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              {t("dialog.addTableButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>{t("dialog.title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("dialog.fields.tableNumberLabel")}</Label>
                <Input
                  placeholder={t("dialog.fields.tableNumberPlaceholder")}
                  value={newTable.tableNumber}
                  onChange={(e) =>
                    setNewTable({ ...newTable, tableNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dialog.fields.capacityLabel")}</Label>
                <Input
                  placeholder={t("dialog.fields.capacityPlaceholder")}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={newTable.capacity ?? ""}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Allow empty while typing
                    if (value === "") {
                      setNewTable({
                        ...newTable,
                        capacity: 1,
                      });
                      return;
                    }

                    const numberValue = Math.max(1, Number(value));

                    setNewTable({
                      ...newTable,
                      capacity: numberValue,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dialog.fields.areaLabel")}</Label>
                <Select
                  value={newTable.areaId}
                  onValueChange={(val) =>
                    setNewTable({ ...newTable, areaId: val })
                  }
                >
                  <SelectTrigger className=" w-full">
                    <SelectValue
                      placeholder={t("dialog.fields.areaPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("dialog.fields.statusLabel")}</Label>
                <Select
                  value={newTable.status}
                  onValueChange={(val) =>
                    setNewTable({
                      ...newTable,
                      status: val as "ACTIVE" | "INACTIVE",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      {t("dialog.fields.active")}
                    </SelectItem>
                    <SelectItem value="INACTIVE">
                      {t("dialog.fields.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddTable}
                disabled={createTableMutation.isPending}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {createTableMutation.isPending
                  ? t("dialog.saving")
                  : t("dialog.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- Grid Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <Card
            key={table.id}
            className="relative gap-0 pb-4 pt-4 overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-[2px]"
          >
            {/* Accent bar on top (status color) */}
            <div
              className={`absolute top-0 left-0 w-full h-1 ${table.status === "ACTIVE" ? "bg-green-500" : "bg-red-400"
                }`}
            />

            {/* Delete Icon */}
            <button
              onClick={() => handleDelete(table.id)}
              className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
              aria-label="Delete table"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Header */}
            <CardHeader className="!yp-2 !px-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {t("grid.tableTitle")} {table.table_number}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {t("grid.capacityLineLabel")}{" "}
                    <span className="text-gray-700 font-medium">
                      {table.capacity} {t("grid.capacitySeats")}
                    </span>
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Body */}
            <CardContent className="flex flex-col gap-4 !py-2 px-4">
              {/* Area Badge */}
              <div>
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 font-medium rounded-md px-3 py-1 shadow-sm"
                >
                  {table.area.name}
                </Badge>
              </div>

              {/* Status & Switch */}
              <div className="flex items-center justify-between border border-gray-100 bg-gray-50 rounded-xl p-2">
                <Badge
                  variant="outline"
                  className={`text-sm font-semibold px-3 py-1 rounded-lg shadow-sm ${table.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                  {table.status === "ACTIVE"
                    ? t("grid.active")
                    : t("grid.inactive")}
                </Badge>

                <Switch
                  checked={table.status === "ACTIVE"}
                  onCheckedChange={() => toggleStatus(table.id, table.status)}
                  disabled={updateTableMutation.isPending}
                  className="scale-110 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 transition-transform duration-300"
                />
              </div>
            </CardContent>

            {/* Footer (optional info) */}
            <div className="px-4 pt-2 text-xs text-gray-400 border-t border-gray-100">
              {t("grid.lastUpdatedLabel")}{" "}
              <span className="text-gray-600 font-medium">
                {new Date(table.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-500">
          {t("grid.noTablesFound")}
        </div>
      )}
    </div>
  );
}
