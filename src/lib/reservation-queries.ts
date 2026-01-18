"use client"

import type { AnalyticsStatusBreakdownResponse, ReservationPayment, ReservationPolicyResponse, ReservationPolicyType, ReservationsListResponse, ReservationsPaymentsListResponse, ReservationUp } from "@/lib/types"
import { ReservationPolicy, ReservationStatus } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import kyInstance from "./ky"

const RESERVATIONS_QUERY_KEY = "reservations"




export const reservationsApi = {
    // Get all reservations for a restaurant
    getReservations: async (params: { restaurantId?: string; date?: string; from?: string; to?: string }): Promise<ReservationUp[]> => {
        const queryParams = new URLSearchParams();

        if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId);
        if (params.date) queryParams.append('date', params.date);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);

        const response = await kyInstance
            .get(`/api/reservations?${queryParams}`)
            .json<ReservationsListResponse>()
        if (!response.success) throw new Error(response.error || "Failed to fetch reservations")
        return response.data || []
    },
    //  Delete reservation
    deleteReservation: async (reservationId: string): Promise<{ success: boolean }> => {
        const response = await kyInstance
            .delete(`/api/reservations?id=${reservationId}`)
            .json<{ success: boolean; error?: string }>();

        if (!response.success)
            throw new Error(response.error || "Failed to delete reservation");
        return { success: true };
    },
    getReservationPayments: async (restaurantId: string): Promise<ReservationPayment[]> => {
        const response = await kyInstance
            .get(`/api/reservations/payments?restaurantId=${restaurantId}`)
            .json<ReservationsPaymentsListResponse>()
        if (!response.success) throw new Error(response.error || "Failed to fetch reservations")
        return response.data || []
    },
    fetchReservationAnalyticsStatusBreakdown: async (restaurantId: string | undefined, date?: string): Promise<AnalyticsStatusBreakdownResponse> => {
        const params = new URLSearchParams({
            ...(date && { date }),
            ...(restaurantId && { restaurantId }),
        });

        const response = await fetch(`/api/reservations/analytics/status-breakdown?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }

        return response.json();
    },
    fetchReservationAnalyticsMainStats: async (
        restaurantId: string | undefined,
        date?: string
    ): Promise<any> => {
        const params = new URLSearchParams({
            ...(date && { date }),
            ...(restaurantId && { restaurantId }),
        });

        const response = await fetch(`/api/reservations/analytics/main-stats?${params}`);

        if (!response.ok) {
            throw new Error("Failed to fetch main stats analytics");
        }

        return response.json();
    },
    fetchReservationAnalyticsDayCapacity: async (
        restaurantId: string | undefined,
        date?: string
    ): Promise<any> => {
        const params = new URLSearchParams({
            ...(date && { date }),
            ...(restaurantId && { restaurantId }),
        });

        const response = await fetch(`/api/reservations/analytics/day-capacity?${params}`);

        if (!response.ok) {
            throw new Error("Failed to fetch day capacity analytics");
        }

        return response.json();
    },
    updateReservationStatus: async (reservationId: string, status: ReservationStatus) => {
        const res = await fetch("/api/reservations/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reservationId, status }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        return data.data;
    },
    getReservationPolicies: async (
        restaurantId: string
    ): Promise<ReservationPolicy | null> => {
        const res = await kyInstance.get(
            `/api/reservations/policies?restaurantId=${restaurantId}`,
            { throwHttpErrors: false }
        );

        if (res.status === 404) {
            // ✅ Not an error for UI: means restaurant hasn't created policies yet
            return null;
        }

        if (!res.ok) {
            const body = await res.json<{
                success: boolean;
                data?: ReservationPolicy;
                error?: string;
            }>().catch(() => null);
            throw new Error(body?.error || "Failed to fetch reservation policies");
        }

        const body = await res.json<{ success: true; data: ReservationPolicy }>();
        return body.data;
    },
    sendReservationReminderEmail: async (reservationId: string) => {
        const res = await fetch("/api/reservations/reminder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reservationId }),
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to send reminder email");
        }

        return data;
    },

};

export function useReservations(
    params: {
        restaurantId: string | undefined;
        date?: string;
        from?: string;
        to?: string;
    },
    enabled: boolean = true
) {
    return useQuery({
        queryKey: [RESERVATIONS_QUERY_KEY, params],
        queryFn: () => reservationsApi.getReservations(params),
        enabled: !!params.restaurantId && enabled,
        // staleTime: 1000 * 60 * 2, // 2 minutes
        staleTime: 0,
    })
}

export function useReservationsPayments(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["payments", RESERVATIONS_QUERY_KEY, restaurantId],
        queryFn: () => reservationsApi.getReservationPayments(restaurantId!),
        enabled: !!restaurantId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    })
}


//  Delete reservation mutation
export function useDeleteReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reservationId: string) =>
            reservationsApi.deleteReservation(reservationId),
        onSuccess: () => {
            // Invalidate cache to refetch updated list
            queryClient.invalidateQueries({ queryKey: [RESERVATIONS_QUERY_KEY] });
        },
    });
}

export const useReservationAnalyticsStatusBreakdown = (restaurantId: string | undefined, date?: string) => {
    return useQuery({
        queryKey: ['reservation-analytics', restaurantId, date],
        queryFn: () =>
            reservationsApi.fetchReservationAnalyticsStatusBreakdown(restaurantId, date),
        enabled: Boolean(restaurantId && date),
        staleTime: 0,
    });
};

export const useReservationAnalyticsMainStats = (
    restaurantId: string | undefined,
    date?: string
) => {
    return useQuery({
        queryKey: ['reservation-analytics-main', restaurantId, date],
        queryFn: () =>
            reservationsApi.fetchReservationAnalyticsMainStats(restaurantId, date),
        enabled: Boolean(restaurantId && date),
        staleTime: 0,
    });
};

export const useReservationAnalyticsDayCapacity = (
    restaurantId: string | undefined,
    date?: string
) => {
    return useQuery({
        queryKey: ['reservation-analytics-day-capacity', restaurantId, date],
        queryFn: () =>
            reservationsApi.fetchReservationAnalyticsDayCapacity(restaurantId, date),
        enabled: Boolean(restaurantId && date),
        staleTime: 0,
    });
};

export function useUpdateReservationStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reservationId,
            status,
        }: {
            reservationId: string;
            status: ReservationStatus;
        }) => reservationsApi.updateReservationStatus(reservationId, status),

        onSuccess: (updatedReservation) => {
            // Update ALL reservations queries
            queryClient.setQueriesData(
                { queryKey: [RESERVATIONS_QUERY_KEY] },
                (oldData: any) => {
                    if (!oldData) return oldData;

                    // When data is list of reservations (array)
                    if (Array.isArray(oldData)) {
                        return oldData.map((r) =>
                            r.id === updatedReservation.id
                                ? { ...r, status: updatedReservation.status }
                                : r
                        );
                    }

                    // When data is { data: [...] }
                    if (oldData?.data) {
                        return {
                            ...oldData,
                            data: oldData.data.map((r: any) =>
                                r.id === updatedReservation.id
                                    ? { ...r, status: updatedReservation.status }
                                    : r
                            ),
                        };
                    }

                    return oldData;
                }
            );
        },
    });
}

export function useReservationPolicies(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["reservation-policies", restaurantId],
        queryFn: () => reservationsApi.getReservationPolicies(restaurantId!),
        enabled: !!restaurantId,
        staleTime: 0,
    });
}

async function upsertReservationPolicy(
    payload: {
        restaurantId: string; // uuid
        type: ReservationPolicyType;
        text: string; // html string
        enabled: boolean;
    }
): Promise<ReservationPolicy> {
    const res = await kyInstance.put("/api/reservations/policies", { json: payload });

    const body = await res.json<ReservationPolicyResponse>();

    if (!body.success) {
        // keep server error shape (zod flatten or string) available to UI
        throw new Error(typeof body.error === "string" ? body.error : "Failed to update policy");
    }

    return body.data;
}

export function useUpdateReservationPolicy() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertReservationPolicy,
        onSuccess: (updatedPolicy, vars) => {
            // Keep GET cache in sync
            queryClient.setQueryData(["reservation-policies", vars.restaurantId], updatedPolicy);

            // Or if you prefer refetch:
            queryClient.invalidateQueries({ queryKey: ["reservation-policies", vars.restaurantId] });
        },
    });
}
export function useSendReservationReminderEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reservationId: string) =>
            reservationsApi.sendReservationReminderEmail(reservationId),

        onSuccess: (response) => {
            const reservationId = response.data.id;

            queryClient.setQueriesData(
                { queryKey: [RESERVATIONS_QUERY_KEY] },
                (oldData: any) => {
                    if (!oldData) return oldData;

                    if (Array.isArray(oldData)) {
                        return oldData.map((r) =>
                            r.id === reservationId
                                ? { ...r, reminder_sent: true }
                                : r
                        );
                    }

                    if (oldData?.data) {
                        return {
                            ...oldData,
                            data: oldData.data.map((r: any) =>
                                r.id === reservationId
                                    ? { ...r, reminder_sent: true }
                                    : r
                            ),
                        };
                    }

                    return oldData;
                }
            );
        },
    });
}

