"use client";

import { useReservationAnalyticsMainStats } from "@/lib/reservation-queries";
import {
  CalendarDays,
  Check,
  DollarSign,
  TrendingUp,
  Users,
  ListChecks,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function MainStats({
  restaurant_id,
  formatted_date,
}: {
  restaurant_id: string | undefined;
  formatted_date: string;
}) {
  const { data, isLoading } = useReservationAnalyticsMainStats(
    restaurant_id,
    formatted_date,
  );
  const t = useTranslations("overviewPage.mainStats.cards");

  const stats = data?.data;

  const totalReservations = stats?.total_reservations ?? 0;
  const confirmedReservations = stats?.confirmed_reservations ?? 0;
  const avgPartySize = stats?.avg_party_size ?? 0;
  const totalDeposit = stats?.total_deposit_gain ?? 0;

  return (
    <div className="w-full grid lg:grid-cols-4 md:grid-cols-2  gap-4">
      {/* Total Reservations */}
      <StatCard
        icon={<ListChecks className="w-7 h-7 opacity-95" />}
        bg="from-indigo-500 to-indigo-600"
        title={t("total.title")}
        value={totalReservations}
        loading={isLoading}
        footerIcon={<CalendarDays className="w-4 h-4" />}
        footerText={`${totalReservations} ${t("total.title")}`}
      />

      {/* Confirmed Reservations */}
      <StatCard
        icon={<CalendarDays className="w-7 h-7 opacity-95" />}
        bg="from-blue-500 to-blue-600"
        title={t("confirmed.title")}
        value={confirmedReservations}
        loading={isLoading}
        footerIcon={<Check className="w-4 h-4" />}
        footerText={`${confirmedReservations} ${t("confirmed.title")}`}
      />

      {/* Covers */}
      <StatCard
        icon={<Users className="w-7 h-7 opacity-95" />}
        bg="from-green-500 to-green-600"
        title={t("covers.title")}
        value={Math.round(totalReservations * avgPartySize)}
        loading={isLoading}
        footerIcon={<TrendingUp className="w-4 h-4" />}
        footerText={`${t("covers.footer", { avg: avgPartySize.toFixed(1) })}`}
      />

      {/* Revenue */}
      <StatCard
        icon={<DollarSign className="w-7 h-7 opacity-95" />}
        bg="from-emerald-600 to-emerald-700"
        title={t("revenue.title")}
        value={`€${totalDeposit.toFixed(2)}`}
        loading={isLoading}
        footerIcon={<TrendingUp className="w-4 h-4" />}
        footerText={t("revenue.footer")}
      />
    </div>
  );
}

function StatCard({
  icon,
  bg,
  title,
  value,
  loading,
  footerIcon,
  footerText,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  value: number | string;
  loading: boolean;
  footerIcon: React.ReactNode;
  footerText: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 text-white bg-gradient-to-br ${bg} flex flex-col justify-between`}
    >
      <div>
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          {icon}

          <div className="text-right">
            {loading ? (
              <Skeleton className="w-16 h-8 rounded-md mb-1" />
            ) : (
              <div className="text-3xl font-bold leading-none">{value}</div>
            )}

            <div className="text-sm mt-1 opacity-95">{title}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/30 mb-4"></div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-sm">
          {footerIcon}
          {loading ? (
            <Skeleton className="w-24 h-4 rounded-md" />
          ) : (
            <span>{footerText}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/30 ${className}`} />;
}
