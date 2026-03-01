"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationQuery } from "@prisma/client";
import { ReservationQueryCard } from "./reservation-query-card";

import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AdminReservationQueriesPageProps {
  restaurantId: string;
}

export default function ReservationQueriesPage({
  restaurantId,
}: AdminReservationQueriesPageProps) {
  const queryClient = useQueryClient();
  const t = useTranslations("reservationQueriesPage");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "important" | "upcoming" | "followup"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchReservationQueries(
    restaurantId: string,
  ): Promise<ReservationQuery[]> {
    const res = await fetch(
      `/api/reservations/query?restaurantId=${restaurantId}`,
    );
    if (!res.ok) throw new Error(t("errorFetchQueries"));
    return res.json();
  }

  async function deleteReservationQuery(
    id: string,
  ): Promise<{ success: boolean }> {
    const res = await fetch(`/api/reservations/query/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(t("deleteError"));
    return res.json();
  }

  const {
    data: queries = [],
    isLoading,
    isError,
  } = useQuery<ReservationQuery[]>({
    queryKey: ["reservation-queries", restaurantId],
    queryFn: () => fetchReservationQueries(restaurantId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReservationQuery(id),
    onSuccess: () => {
      toast(t("deleteSuccess"));
      queryClient.invalidateQueries({
        queryKey: ["reservation-queries", restaurantId],
      });
    },
    onError: () => {
      toast(t("deleteError"));
    },
  });

  function handleDelete(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;
    deleteMutation.mutate(id);
  }

  const filteredQueries = useMemo(() => {
    let result = [...queries];

    if (activeFilter !== "all") {
      result = result.filter((q) => q.status === activeFilter);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.email.toLowerCase().includes(term),
      );
    }

    return result;
  }, [queries, activeFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("errorTitle")}</AlertTitle>
        <AlertDescription>{t("errorDescription")}</AlertDescription>
      </Alert>
    );
  }

  const isEmpty = queries.length === 0;

  return (
    <div className="min-h-screen">
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t("pageTitle")}
            </h2>
            <p className="text-slate-600 mt-1">{t("pageDescription")}</p>
          </div>
        </div>

        {/* Search */}
        <div className="w-full max-w-sm">
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-white h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("filterEmptyTitle")}</AlertTitle>
            <AlertDescription>{t("emptyDescription")}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer
                  ${
                    activeFilter === "all"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }
                `}
              >
                {t("filterAll")} ({queries.length})
              </button>

              <button
                onClick={() => setActiveFilter("important")}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer
                  ${
                    activeFilter === "important"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  }
                `}
              >
                {t("filterImportantWithCount")} (
                {queries.filter((q) => q.status === "important").length})
              </button>

              <button
                onClick={() => setActiveFilter("upcoming")}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer
                  ${
                    activeFilter === "upcoming"
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                  }
                `}
              >
                {t("filterUpcomingWithCount")} (
                {queries.filter((q) => q.status === "upcoming").length})
              </button>

              <button
                onClick={() => setActiveFilter("followup")}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer
                  ${
                    activeFilter === "followup"
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                  }
                `}
              >
                {t("filterFollowupWithCount")} (
                {queries.filter((q) => q.status === "followup").length})
              </button>
            </div>

            {/* Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredQueries.length > 0 ? (
                filteredQueries.map((query) => (
                  <ReservationQueryCard
                    key={query.id}
                    query={query}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <Alert className="md:col-span-2 lg:col-span-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("filterEmptyTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("filterEmptyDescription")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
