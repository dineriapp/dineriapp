import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ky from "./ky"
import { toast } from "sonner"
import { Link } from "@prisma/client"
import { IconSlug } from "./get-icons"

type LinkWithCount = Link & {
    _count: {
        views: number
    }
}

export function useLinks(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["links", restaurantId],
        queryFn: async () => {
            if (!restaurantId) return []
            const response = await ky.get(`/api/links?restaurant_id=${restaurantId}`).json<{ data: LinkWithCount[] }>()
            return response.data
        },
        enabled: !!restaurantId, // Only run query when restaurantId is available
        staleTime: 60 * 1000, // 1 minute
    })
}

export function useCreateLink(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: { title: string; url: string, iconSlug?: IconSlug }) => {
            if (!restaurantId) throw new Error("Restaurant ID is required")

            const response = await ky
                .post("/api/links", {
                    json: { ...data, restaurant_id: restaurantId, iconSlug: data.iconSlug || "link" },
                })
                .json<{ data: LinkWithCount }>()
            return response.data
        },
        onMutate: async (newLink) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["links", restaurantId] })

            const previousLinks = queryClient.getQueryData<LinkWithCount[]>(["links", restaurantId])

            const optimisticLink: LinkWithCount = {
                id: `temp-${Date.now()}`,
                restaurant_id: restaurantId,
                title: newLink.title,
                url: newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`,
                sort_order:
                    !previousLinks || previousLinks.length === 0 ? 0 : Math.max(...previousLinks.map((l) => l.sort_order)) + 1,
                show_icon: true,
                icon_slug: newLink.iconSlug || "link",
                createdAt: new Date(),
                _count: {
                    views: 0
                }
            }

            queryClient.setQueryData<LinkWithCount[]>(["links", restaurantId], (old) =>
                old ? [...old, optimisticLink] : [optimisticLink],
            )

            return { previousLinks, optimisticLink }
        },
        onError: (err, newLink, context) => {
            if (restaurantId && context?.previousLinks) {
                queryClient.setQueryData(["links", restaurantId], context.previousLinks)
            }
            toast.error("Failed to add link")
        },
        onSuccess: () => {
            toast.success("Link added successfully")
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
    })
}

export function useUpdateLink(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; title: string; url: string, iconSlug?: IconSlug }) => {
            const response = await ky.put(`/api/links/${id}`, { json: { ...data, iconSlug: data.iconSlug || "libk" } }).json<{ data: LinkWithCount, }>()
            return response.data
        },
        onMutate: async (updatedLink) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["links", restaurantId] })

            const previousLinks = queryClient.getQueryData<LinkWithCount[]>(["links", restaurantId])

            queryClient.setQueryData<LinkWithCount[]>(
                ["links", restaurantId],
                (old) =>
                    old?.map((link) =>
                        link.id === updatedLink.id ? { ...link, title: updatedLink.title, url: updatedLink.url } : link,
                    ) || [],
            )

            return { previousLinks }
        },
        onError: (err, updatedLink, context) => {
            if (restaurantId && context?.previousLinks) {
                queryClient.setQueryData(["links", restaurantId], context.previousLinks)
            }
            toast.error("Failed to update link")
        },
        onSuccess: () => {
            toast.success("Link updated successfully")
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
    })
}

export function useDeleteLink(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await ky.delete(`/api/links/${id}`)
            return id
        },
        onMutate: async (deletedId) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["links", restaurantId] })

            const previousLinks = queryClient.getQueryData<LinkWithCount[]>(["links", restaurantId])

            queryClient.setQueryData<LinkWithCount[]>(
                ["links", restaurantId],
                (old) => old?.filter((link) => link.id !== deletedId) || [],
            )

            return { previousLinks }
        },
        onError: (err, deletedId, context) => {
            if (restaurantId && context?.previousLinks) {
                queryClient.setQueryData(["links", restaurantId], context.previousLinks)
            }
            toast.error("Failed to delete link")
        },
        onSuccess: () => {
            toast.success("Link deleted successfully")
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
    })
}

export function useBulkDeleteLinks(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (linkIds: string[]) => {
            const response = await ky
                .delete("/api/links/bulk-delete", {
                    json: { linkIds },
                })
                .json<{ data: { deletedCount: number } }>()
            return response.data
        },
        onMutate: async (deletedIds) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["links", restaurantId] })

            const previousLinks = queryClient.getQueryData<LinkWithCount[]>(["links", restaurantId])

            queryClient.setQueryData<LinkWithCount[]>(
                ["links", restaurantId],
                (old) => old?.filter((link) => !deletedIds.includes(link.id)) || [],
            )

            return { previousLinks }
        },
        onError: (err, deletedIds, context) => {
            if (restaurantId && context?.previousLinks) {
                queryClient.setQueryData(["links", restaurantId], context.previousLinks)
            }
            toast.error("Failed to delete links")
        },
        onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} link${data.deletedCount > 1 ? "s" : ""}`)
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
    })
}

export function useReorderLink(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ linkId, direction }: { linkId: string; direction: "up" | "down" }) => {
            const response = await ky
                .put("/api/links/reorder", {
                    json: { linkId, direction },
                })
                .json<{ data: LinkWithCount[] }>()
            return response.data
        },
        onMutate: async ({ linkId, direction }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["links", restaurantId] })

            const previousLinks = queryClient.getQueryData<LinkWithCount[]>(["links", restaurantId])

            if (previousLinks) {
                const currentIndex = previousLinks.findIndex((link) => link.id === linkId)
                const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

                if (newIndex >= 0 && newIndex < previousLinks.length) {
                    const newLinks = [...previousLinks]
                    const temp = newLinks[currentIndex].sort_order
                    newLinks[currentIndex].sort_order = newLinks[newIndex].sort_order
                    newLinks[newIndex].sort_order = temp
                    newLinks.sort((a, b) => a.sort_order - b.sort_order)

                    queryClient.setQueryData(["links", restaurantId], newLinks)
                }
            }

            return { previousLinks }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousLinks) {
                queryClient.setQueryData(["links", restaurantId], context.previousLinks)
            }
            toast.error("Failed to reorder link")
        },
        onSuccess: () => {
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["links", restaurantId] })
            }
        },
    })
}
