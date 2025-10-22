"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AreaResponse, AreasListResponse, CreateAreaInput, UpdateAreaInput } from "@/lib/types"
import kyInstance from "./ky"
import { Area } from "@prisma/client"

const AREAS_QUERY_KEY = "areas"

export const areasApi = {
    // Get all areas for a restaurant
    getAreas: async (restaurantId: string): Promise<Area[]> => {
        const response = await kyInstance.get(`/api/areas?restaurantId=${restaurantId}`).json<AreasListResponse>()
        if (!response.success) throw new Error(response.error || "Failed to fetch areas")
        return response.data || []
    },

    // Create a new area
    createArea: async (restaurantId: string, data: CreateAreaInput): Promise<Area> => {
        const response = await kyInstance
            .post("/api/areas", {
                json: { ...data, restaurant_id: restaurantId },
            })
            .json<AreaResponse>()
        if (!response.success) throw new Error(response.error || "Failed to create area")
        return response.data!
    },

    // Update an area
    updateArea: async (areaId: string, data: UpdateAreaInput): Promise<Area> => {
        const response = await kyInstance
            .put(`/api/areas/${areaId}`, {
                json: data,
            })
            .json<AreaResponse>()
        if (!response.success) throw new Error(response.error || "Failed to update area")
        return response.data!
    },

    // Delete an area
    deleteArea: async (areaId: string): Promise<void> => {
        const response = await kyInstance.delete(`/api/areas/${areaId}`).json<AreaResponse>()
        if (!response.success) throw new Error(response.error || "Failed to delete area")
    },
}

export function useAreas(restaurantId: string | undefined) {
    return useQuery({
        queryKey: [AREAS_QUERY_KEY, restaurantId],
        queryFn: () => areasApi.getAreas(restaurantId!),
        enabled: !!restaurantId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useCreateArea(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAreaInput) => areasApi.createArea(restaurantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AREAS_QUERY_KEY, restaurantId] })
        },
    })
}

export function useUpdateArea() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ areaId, data }: { areaId: string; data: UpdateAreaInput }) => areasApi.updateArea(areaId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AREAS_QUERY_KEY] })
        },
    })
}

export function useDeleteArea() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (areaId: string) => areasApi.deleteArea(areaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AREAS_QUERY_KEY] })
        },
    })
}
