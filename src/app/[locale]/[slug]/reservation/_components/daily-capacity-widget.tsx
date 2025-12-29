"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ProductionCapacityData {
  canCreateReservation: boolean;
  reason: string;
}

interface DailyCapacityWidgetProps {
  restaurantId: string;
  date: string;
  partySize: number;

  onLoadingChange?: (loading: boolean) => void;
  onAvailabilityChange?: (available: boolean) => void;
  onReasonChange?: (reason: string) => void;
}

const DailyCapacityWidget = ({
  restaurantId,
  date,
  partySize,
  onLoadingChange,
  onReasonChange,
  onAvailabilityChange,
}: DailyCapacityWidgetProps) => {
  const t = useTranslations("makeAReservation.dailyCapacity");

  const [capacityData, setCapacityData] =
    useState<ProductionCapacityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapacityData = async (date: string, partySize: number) => {
    setLoading(true);
    onLoadingChange?.(true);
    setError(null);

    try {
      const url = `/api/restaurants/${restaurantId}/check-availibility?date=${date}&partySize=${partySize}`;
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"));
      }

      const result = await response.json();

      if (result.success) {
        setCapacityData(result.data);
        onAvailabilityChange?.(result.data.canCreateReservation);
        onReasonChange?.(result.data.reason);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    fetchCapacityData(date, partySize);
  }, [date, partySize, restaurantId]);

  const getStatusColor = (status: boolean) =>
    status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  // ------------ UI ------------
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-48 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded mt-1"></div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <div className="mt-2">
          <div className="rounded-lg p-3 border bg-gray-100 border-gray-200">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 text-center">
          <p>{t("errors.title")}</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!capacityData) return null;

  const { canCreateReservation, reason } = capacityData;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t("title")}</h2>
          <p className="text-xs text-gray-500">
            {partySize ? t("guests", { partySize }) : null}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              canCreateReservation
            )}`}
          >
            {canCreateReservation
              ? t("status.available")
              : t("status.notAvailable")}
          </div>
        </div>
      </div>

      {reason === "Reservation can be created successfully" ? null : (
        <div className="mt-2">
          <div
            className={`rounded-lg p-3 ${
              canCreateReservation
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm ${
                canCreateReservation ? "text-green-800" : "text-red-800"
              }`}
            >
              {reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCapacityWidget;
