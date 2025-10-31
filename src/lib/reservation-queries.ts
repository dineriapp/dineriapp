"use client"

import type { ReservationPayment, ReservationsListResponse, ReservationsPaymentsListResponse, ReservationStatsResponse, ReservationUp } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import kyInstance from "./ky"

const RESERVATIONS_QUERY_KEY = "reservations"
const RESERVATION_STATS_QUERY_KEY = "reservation-stats"

export const reservationsApi = {
    // Get all reservations for a restaurant
    getReservations: async (restaurantId: string): Promise<ReservationUp[]> => {
        const response = await kyInstance
            .get(`/api/reservations?restaurantId=${restaurantId}`)
            .json<ReservationsListResponse>()
        if (!response.success) throw new Error(response.error || "Failed to fetch reservations")
        return response.data || []
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

export function useReservations(restaurantId: string | undefined) {
    return useQuery({
        queryKey: [RESERVATIONS_QUERY_KEY, restaurantId],
        queryFn: () => reservationsApi.getReservations(restaurantId!),
        enabled: !!restaurantId,
        staleTime: 1000 * 60 * 2, // 2 minutes
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
