import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ky from "./ky"
import { toast } from "sonner"
import type { Event } from "@prisma/client"

export function useEvents(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["events", restaurantId],
        queryFn: async () => {
            if (!restaurantId) return []
            const response = await ky.get(`/api/events?restaurant_id=${restaurantId}`).json<{ data: Event[] }>()
            return response.data
        },
        enabled: !!restaurantId,
        staleTime: 60 * 1000, // 1 minute
    })
}

export function useCreateEvent(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (variables: {
            title: string
            description?: string
            date: string
            ticket_url?: string
        }) => {
            if (!restaurantId) throw new Error("Restaurant ID is required")

            const response = await ky
                .post("/api/events", {
                    json: { ...variables, restaurant_id: restaurantId },
                })
                .json<{ data: Event }>()
            return response.data
        },
        onMutate: async (variables) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["events", restaurantId] })

            const previousEvents = queryClient.getQueryData<Event[]>(["events", restaurantId])

            const optimisticEvent: Event = {
                id: `temp-${Date.now()}`,
                restaurant_id: restaurantId,
                title: variables.title,
                description: variables.description || null,
                date: new Date(variables.date),
                ticket_url: variables.ticket_url || null,
                sort_order:
                    previousEvents && previousEvents.length > 0 ? Math.max(...previousEvents.map((e) => e.sort_order)) + 1 : 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            queryClient.setQueryData<Event[]>(["events", restaurantId], (old) =>
                old ? [...old, optimisticEvent] : [optimisticEvent],
            )

            return { previousEvents, optimisticEvent }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousEvents) {
                queryClient.setQueryData(["events", restaurantId], context.previousEvents)
            }
            toast.error("Failed to add event")
        },
        onSuccess: () => {
            toast.success("Event added successfully");
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["events", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["events", restaurantId] })
            }
        },
    })
}

export function useUpdateEvent(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (variables: {
            id: string
            title: string
            description?: string
            date: string
            ticket_url?: string
        }) => {
            const response = await ky
                .put(`/api/events/${variables.id}`, {
                    json: {
                        title: variables.title,
                        description: variables.description,
                        date: variables.date,
                        ticket_url: variables.ticket_url,
                    },
                })
                .json<{ data: Event }>()
            return response.data
        },
        onMutate: async (variables) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["events", restaurantId] })

            const previousEvents = queryClient.getQueryData<Event[]>(["events", restaurantId])

            queryClient.setQueryData<Event[]>(
                ["events", restaurantId],
                (old) =>
                    old?.map((event) =>
                        event.id === variables.id
                            ? {
                                ...event,
                                title: variables.title,
                                description: variables.description || null,
                                date: new Date(variables.date),
                                ticket_url: variables.ticket_url || null,
                                updatedAt: new Date(),
                            }
                            : event,
                    ) || [],
            )

            return { previousEvents }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousEvents) {
                queryClient.setQueryData(["events", restaurantId], context.previousEvents)
            }
            toast.error("Failed to update event")
        },
        onSuccess: () => {
            toast.success("Event updated successfully")
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["events", restaurantId] })
            }
        },
    })
}

export function useDeleteEvent(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await ky.delete(`/api/events/${id}`)
            return id
        },
        onMutate: async (deletedId) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["events", restaurantId] })

            const previousEvents = queryClient.getQueryData<Event[]>(["events", restaurantId])

            queryClient.setQueryData<Event[]>(
                ["events", restaurantId],
                (old) => old?.filter((event) => event.id !== deletedId) || [],
            )

            return { previousEvents }
        },
        onError: (err, deletedId, context) => {
            if (restaurantId && context?.previousEvents) {
                queryClient.setQueryData(["events", restaurantId], context.previousEvents)
            }
            toast.error("Failed to delete event")
        },
        onSuccess: () => {
            toast.success("Event deleted successfully")
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["events", restaurantId] })
            }
        },
    })
}

export function useReorderEvent(restaurantId: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ eventId, direction }: { eventId: string; direction: "up" | "down" }) => {
            const response = await ky
                .put("/api/events/reorder", {
                    json: { eventId, direction },
                })
                .json<{ data: Event[] }>()
            return response.data
        },
        onMutate: async ({ eventId, direction }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["events", restaurantId] })

            const previousEvents = queryClient.getQueryData<Event[]>(["events", restaurantId])

            if (previousEvents) {
                const currentIndex = previousEvents.findIndex((event) => event.id === eventId)
                const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

                if (newIndex >= 0 && newIndex < previousEvents.length) {
                    const newEvents = [...previousEvents]
                    const temp = newEvents[currentIndex].sort_order
                    newEvents[currentIndex].sort_order = newEvents[newIndex].sort_order
                    newEvents[newIndex].sort_order = temp
                    newEvents.sort((a, b) => a.sort_order - b.sort_order)

                    queryClient.setQueryData(["events", restaurantId], newEvents)
                }
            }

            return { previousEvents }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousEvents) {
                queryClient.setQueryData(["events", restaurantId], context.previousEvents)
            }
            toast.error("Failed to reorder event")
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["events", restaurantId] })
            }
        },
    })
}
