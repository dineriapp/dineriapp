"use client";

import { ErrorMessage } from "@/components/error-message";
import LoadingUI from "@/components/loading-ui";
import { QRCodeItem } from "@/components/pages/dashboard/qr/qr-code-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteQRCode, useQRCodes, useQRCodeStats } from "@/lib/qr-queries";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { BarChart3, Eye, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { QRCodeGeneratorComponent } from "./qr-code-generator";
import { useTranslations } from "next-intl";

export default function QRCodesPage() {
  const { selectedRestaurant: restaurant } = useRestaurantStore();
  const [activeTab, setActiveTab] = useState("analytics");
  const t = useTranslations("qr-codes-page");
  const {
    data: qrCodes = [],
    isLoading: qrCodesLoading,
    error: qrCodesError,
  } = useQRCodes(restaurant?.id || "");

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQRCodeStats(restaurant?.id || "");

  const deleteQRCodeMutation = useDeleteQRCode(restaurant?.id || "");

  const handleDeleteQRCode = async (id: string) => {
    if (!confirm(t("actions.deleteConfirm"))) return;

    try {
      await deleteQRCodeMutation.mutateAsync(id);
    } catch {
      // Error handling is done in the mutation
    }
  };

  const getScanUrl = (qrCodeId: string) => {
    return `${window.location.origin}/api/qr-codes/scan/${qrCodeId}`;
  };

  const copyScanUrl = (qrCodeId: string) => {
    const url = getScanUrl(qrCodeId);
    navigator.clipboard.writeText(url);
    toast.success(t("actions.copySuccess"));
  };

  const downloadQRCode = (qrCode: any) => {
    if (!qrCode.qr_data_url) {
      toast.error(t("actions.downloadError"));
      return;
    }

    // Create download link
    const link = document.createElement("a");
    link.download = `${qrCode.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
    link.href = qrCode.qr_data_url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("actions.downloadSuccess"));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "restaurant_page":
        return t("types.restaurant_page");
      case "link":
        return t("types.link");
      case "custom":
        return t("types.custom");
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "restaurant_page":
        return "bg-blue-100 text-blue-800";
      case "link":
        return "bg-green-100 text-green-800";
      case "custom":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const loading = qrCodesLoading || statsLoading;

  if (loading || !restaurant) {
    return <LoadingUI text={t("loading")} />;
  }

  if (qrCodesError || statsError) {
    return (
      <ErrorMessage
        title={t("errors.loadErrorTitle")}
        message={t("errors.loadErrorMessage")}
      />
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-main-blue">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 h-[44px]">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("tabs.analytics")}
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            {t("tabs.generator")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
              <div className="grid gap-6 900:grid-cols-3 md:grid-cols-2">
                <Card className=" box-shad-every-2 bg-white border-main-green/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("stats.totalQRCodes")}
                    </CardTitle>
                    <QrCode className="h-4 w-4 text-teal-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-teal-700">
                      {stats.totalQRCodes}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.activeQRCodes} {t("stats.active")}
                    </p>
                  </CardContent>
                </Card>

                <Card className=" box-shad-every-2 bg-white border-main-green/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("stats.totalScans")}
                    </CardTitle>
                    <Eye className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-700">
                      {stats.totalScans}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("stats.allTime")}
                    </p>
                  </CardContent>
                </Card>

                <Card className=" box-shad-every-2 bg-white border-main-green/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("stats.avgScans")}
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-700">
                      {stats.totalQRCodes > 0
                        ? Math.round(stats.totalScans / stats.totalQRCodes)
                        : 0}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("stats.perQRCode")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* QR Code List */}
            <Card className="pt-0 ">
              <CardHeader className="font-poppins bg-gray-100/50 py-4 ">
                <CardTitle>{t("list.title")}</CardTitle>
                <CardDescription>{t("list.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {qrCodes.length > 0 ? (
                  <div className="space-y-4">
                    {qrCodes.map((qr) => (
                      <QRCodeItem
                        key={qr.id}
                        qr={{
                          ...qr,
                          typeLabel: getTypeLabel(qr.type),
                          typeClass: getTypeColor(qr.type),
                        }}
                        getScanUrl={getScanUrl}
                        onCopy={copyScanUrl}
                        onDownload={downloadQRCode}
                        onDelete={handleDeleteQRCode}
                        isDeleting={deleteQRCodeMutation.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <QrCode className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">
                      {t("list.empty.title")}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {t("list.empty.title")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generator">
          <QRCodeGeneratorComponent restaurant={restaurant} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
