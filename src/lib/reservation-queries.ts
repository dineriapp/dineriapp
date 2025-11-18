"use client"

import type { ReservationPayment, ReservationsListResponse, ReservationsPaymentsListResponse, ReservationStatsResponse, ReservationUp } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import kyInstance from "./ky"

const RESERVATIONS_QUERY_KEY = "reservations"
const RESERVATION_STATS_QUERY_KEY = "reservation-stats"

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

    // Get reservation stats
    getReservationStats: async (
        restaurantId: string,
    ): Promise<{
        total: number
        confirmed: number
        pending: number
        cancelled: number
        checkedIn: number
    }> => {
        const response = await kyInstance
            .get(`/api/reservations/stats?restaurantId=${restaurantId}`)
            .json<ReservationStatsResponse>()
        if (!response.success) throw new Error(response.error || "Failed to fetch stats")
        return response.data || { total: 0, confirmed: 0, pending: 0, cancelled: 0, checkedIn: 0 }
    },
}

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

export function useReservationStats(restaurantId: string | undefined) {
    return useQuery({
        queryKey: [RESERVATION_STATS_QUERY_KEY, restaurantId],
        queryFn: () => reservationsApi.getReservationStats(restaurantId!),
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