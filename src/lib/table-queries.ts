"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateTableInput, TableResponse, TablesListResponse, UpdateTableInput } from "@/lib/types"
import { Area, Table } from "@prisma/client"
import kyInstance from "./ky"

const TABLES_QUERY_KEY = "tables"


export const tablesApi = {
    // Get all tables for a restaurant
    getTables: async (restaurantId: string): Promise<(Table & { area: Area })[]> => {
        const response = await kyInstance.get(`/api/tables?restaurantId=${restaurantId}`).json<TablesListResponse>()
        if (!response.success) throw new Error(response.error || "Failed to fetch tables")
        return response.data || []
    },

    // Create a new table
    createTable: async (
        restaurantId: string,
        data: CreateTableInput
    ): Promise<Table> => {
        try {
            const response = await kyInstance
                .post("/api/tables", {
                    json: { ...data, restaurant_id: restaurantId },
                })
                .json<TableResponse>()

            if (!response.success) {
                throw new Error(response.error || "Failed to create table")
            }

            return response.data!

        } catch (error: any) {
            // Extract backend error message if available
            if (error.response) {
                const errorData = await error.response.json()
                throw new Error(errorData.error || "Failed to create table")
            }

            throw new Error(error.message || "Something went wrong")
        }
    },

    // Update a table
    updateTable: async (tableId: string, data: UpdateTableInput): Promise<Table> => {
        const response = await kyInstance
            .put(`/api/tables/${tableId}`, {
                json: data,
            })
            .json<TableResponse>()
        if (!response.success) throw new Error(response.error || "Failed to update table")
        return response.data!
    },

    // Delete a table
    deleteTable: async (tableId: string): Promise<void> => {
        const response = await kyInstance.delete(`/api/tables/${tableId}`).json<TableResponse>()
        if (!response.success) throw new Error(response.error || "Failed to delete table")
    },
}

export function useTables(restaurantId: string | undefined) {
    return useQuery({
        queryKey: [TABLES_QUERY_KEY, restaurantId],
        queryFn: () => tablesApi.getTables(restaurantId!),
        enabled: !!restaurantId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useCreateTable(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTableInput) => tablesApi.createTable(restaurantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TABLES_QUERY_KEY, restaurantId] })
        },
    })
}

export function useUpdateTable() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tableId, data }: { tableId: string; data: UpdateTableInput }) =>
            tablesApi.updateTable(tableId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TABLES_QUERY_KEY] })
        },
    })
}

export function useDeleteTable() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (tableId: string) => tablesApi.deleteTable(tableId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TABLES_QUERY_KEY] })
        },
    })
}
