import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreateQRCodeInput, UpdateQRCodeInput } from "./qr-validations"
import { qr_codes as QRCode } from "@prisma/client"


export interface QRCodeStats {
    qrCodes: QRCode[]
    totalQRCodes: number
    totalScans: number
    activeQRCodes: number
}

// Query Keys
export const qrCodeKeys = {
    all: ["qr-codes"] as const,
    lists: () => [...qrCodeKeys.all, "list"] as const,
    list: (restaurantId: string) => [...qrCodeKeys.lists(), restaurantId] as const,
    details: () => [...qrCodeKeys.all, "detail"] as const,
    detail: (id: string) => [...qrCodeKeys.details(), id] as const,
    stats: () => [...qrCodeKeys.all, "stats"] as const,
    stat: (restaurantId: string) => [...qrCodeKeys.stats(), restaurantId] as const,
}

// Fetch QR Codes
export function useQRCodes(restaurantId: string) {
    return useQuery({
        queryKey: qrCodeKeys.list(restaurantId),
        queryFn: async (): Promise<QRCode[]> => {
            if (!restaurantId) return []

            const response = await fetch(`/api/qr-codes?restaurant_id=${restaurantId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch QR codes")
            }
            return response.json()
        },
        enabled: !!restaurantId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Fetch Single QR Code
export function useQRCode(id: string) {
    return useQuery({
        queryKey: qrCodeKeys.detail(id),
        queryFn: async (): Promise<QRCode> => {
            const response = await fetch(`/api/qr-codes/${id}`)
            if (!response.ok) {
                throw new Error("Failed to fetch QR code")
            }
            return response.json()
        },
        enabled: !!id,
    })
}

// Fetch QR Code Stats
export function useQRCodeStats(restaurantId: string) {
    return useQuery({
        queryKey: qrCodeKeys.stat(restaurantId),
        queryFn: async (): Promise<QRCodeStats> => {
            if (!restaurantId) {
                return {
                    qrCodes: [],
                    totalQRCodes: 0,
                    totalScans: 0,
                    activeQRCodes: 0,
                }
            }

            const response = await fetch(`/api/qr-codes/stats?restaurant_id=${restaurantId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch QR code stats")
            }
            return response.json()
        },
        enabled: !!restaurantId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Create QR Code
export function useCreateQRCode(restaurantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateQRCodeInput): Promise<QRCode> => {
            const response = await fetch(`/api/qr-codes?restaurant_id=${restaurantId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create QR code")
            }

            return response.json()
        },
        onSuccess: (newQRCode) => {
            // Add to the list
            queryClient.setQueryData(qrCodeKeys.list(restaurantId), (old: QRCode[] | undefined) => {
                return old ? [newQRCode, ...old] : [newQRCode]
            })

            // Invalidate stats to refresh counts
            queryClient.invalidateQueries({ queryKey: qrCodeKeys.stat(restaurantId) })

            toast.success("QR code created successfully!")
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to create QR code")
        },
    })
}

// Update QR Code
export function useUpdateQRCode(restaurantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateQRCodeInput }): Promise<QRCode> => {
            const response = await fetch(`/api/qr-codes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update QR code")
            }

            return response.json()
        },
        onSuccess: (updatedQRCode) => {
            // Update the QR code in the list
            queryClient.setQueryData(qrCodeKeys.list(restaurantId), (old: QRCode[] | undefined) => {
                return old?.map((qr) => (qr.id === updatedQRCode.id ? updatedQRCode : qr))
            })

            // Update individual QR code cache
            queryClient.setQueryData(qrCodeKeys.detail(updatedQRCode.id), updatedQRCode)

            // Invalidate stats if active status changed
            if (updatedQRCode.is_active !== undefined) {
                queryClient.invalidateQueries({ queryKey: qrCodeKeys.stat(restaurantId) })
            }

            toast.success("QR code updated successfully!")
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to update QR code")
        },
    })
}

// Delete QR Code
export function useDeleteQRCode(restaurantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            const response = await fetch(`/api/qr-codes/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to delete QR code")
            }
        },
        onSuccess: (_, deletedId) => {
            // Remove from the list
            queryClient.setQueryData(qrCodeKeys.list(restaurantId), (old: QRCode[] | undefined) => {
                return old?.filter((qr) => qr.id !== deletedId)
            })

            // Remove individual cache
            queryClient.removeQueries({ queryKey: qrCodeKeys.detail(deletedId) })

            // Invalidate stats to refresh counts
            queryClient.invalidateQueries({ queryKey: qrCodeKeys.stat(restaurantId) })

            toast.success("QR code deleted successfully!")
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to delete QR code")
        },
    })
}
