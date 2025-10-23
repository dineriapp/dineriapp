"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateReservationInput, ReservationUp, ReservationResponse, ReservationsListResponse, ReservationStatsResponse, UpdateReservationInput } from "@/lib/types"
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

    // Create a new reservation
    createReservation: async (restaurantId: string, data: CreateReservationInput): Promise<ReservationUp> => {
        const response = await kyInstance
            .post("/api/reservations", {
                json: { ...data, restaurant_id: restaurantId },
            })
            .json<ReservationResponse>()
        if (!response.success) throw new Error(response.error || "Failed to create reservation")
        return response.data!
    },

    // Update a reservation
    updateReservation: async (reservationId: string, data: UpdateReservationInput): Promise<ReservationUp> => {
        const response = await kyInstance
            .put(`/api/reservations/${reservationId}`, {
                json: data,
            })
            .json<ReservationResponse>()
        if (!response.success) throw new Error(response.error || "Failed to update reservation")
        return response.data!
    },

    // Delete a reservation
    deleteReservation: async (reservationId: string): Promise<void> => {
        const response = await kyInstance.delete(`/api/reservations/${reservationId}`).json<ReservationResponse>()
        if (!response.success) throw new Error(response.error || "Failed to delete reservation")
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

export function useReservationStats(restaurantId: string | undefined) {
    return useQuery({
        queryKey: [RESERVATION_STATS_QUERY_KEY, restaurantId],
        queryFn: () => reservationsApi.getReservationStats(restaurantId!),
        enabled: !!restaurantId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    })
}

export function useCreateReservation(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateReservationInput) => reservationsApi.createReservation(restaurantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [RESERVATIONS_QUERY_KEY, restaurantId] })
            queryClient.invalidateQueries({ queryKey: [RESERVATION_STATS_QUERY_KEY, restaurantId] })
        },
    })
}

export function useUpdateReservation(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ reservationId, data }: { reservationId: string; data: UpdateReservationInput }) =>
            reservationsApi.updateReservation(reservationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [RESERVATIONS_QUERY_KEY, restaurantId] })
            queryClient.invalidateQueries({ queryKey: [RESERVATION_STATS_QUERY_KEY, restaurantId] })
        },
    })
}

export function useDeleteReservation(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (reservationId: string) => reservationsApi.deleteReservation(reservationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [RESERVATIONS_QUERY_KEY, restaurantId] })
            queryClient.invalidateQueries({ queryKey: [RESERVATION_STATS_QUERY_KEY, restaurantId] })
        },
    })
}
