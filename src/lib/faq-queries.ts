import type { Faq, FaqCategory } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import ky from "./ky"
import { useTranslations } from "next-intl"

// Use Prisma types with relations
export type FaqCategoryWithFaqs = FaqCategory & {
    faqs: Faq[]
}

export function useFaqCategories(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["faq-categories", restaurantId],
        queryFn: async () => {
            if (!restaurantId) return []
            const response = await ky
                .get(`/api/faq/categories?restaurant_id=${restaurantId}`)
                .json<{ data: FaqCategoryWithFaqs[] }>()
            return response.data
        },
        enabled: !!restaurantId,
        staleTime: 60 * 1000,
    })
}

export function useCreateFaqCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")
    return useMutation({
        mutationFn: async (data: { name: string; description?: string }) => {
            if (!restaurantId) throw new Error(t("errors.restaurant_id_required"))

            const response = await ky
                .post("/api/faq/categories", {
                    json: { ...data, restaurant_id: restaurantId },
                })
                .json<{ data: FaqCategoryWithFaqs }>()
            return response.data
        },
        onMutate: async (newCategory: { name: string; description?: string }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            const optimisticCategory: FaqCategoryWithFaqs = {
                id: `temp-${Date.now()}`,
                restaurant_id: restaurantId,
                name: newCategory.name,
                description: newCategory.description || null,
                sort_order:
                    !previousCategories || previousCategories.length === 0
                        ? 0
                        : Math.max(...previousCategories.map((c) => c.sort_order)) + 1,
                faqs: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            queryClient.setQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId], (old) =>
                old ? [...old, optimisticCategory] : [optimisticCategory],
            )

            return { previousCategories, optimisticCategory }
        },
        onError: (err, newCategory, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_add_faq_category"))
        },
        onSuccess: () => {
            toast.success(t("success.faq_category_added_successfully"))
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}

export function useUpdateFaqCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; name: string; description?: string }) => {
            const response = await ky.put(`/api/faq/categories/${id}`, { json: data }).json<{ data: FaqCategory }>()
            return response.data
        },
        onMutate: async (variables: { id: string; name: string; description?: string }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            queryClient.setQueryData<FaqCategoryWithFaqs[]>(
                ["faq-categories", restaurantId],
                (old) =>
                    old?.map((cat) =>
                        cat.id === variables.id
                            ? { ...cat, name: variables.name, description: variables.description || null }
                            : cat,
                    ) || [],
            )

            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_update_faq_category"))
        },
        onSuccess: () => {
            toast.success(t("success.faq_category_updated_successfully"))
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}

export function useDeleteFaqCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")

    return useMutation({
        mutationFn: async (id: string) => {
            await ky.delete(`/api/faq/categories/${id}`)
            return id
        },
        onMutate: async (deletedId: string) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            queryClient.setQueryData<FaqCategoryWithFaqs[]>(
                ["faq-categories", restaurantId],
                (old) => old?.filter((cat) => cat.id !== deletedId) || [],
            )

            return { previousCategories }
        },
        onError: (err, deletedId, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_delete_faq_category"))
        },
        onSuccess: () => {
            toast.success(t("success.faq_category_deleted_successfully"))
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}

export function useReorderFaqCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")

    return useMutation({
        mutationFn: async ({ categoryId, direction }: { categoryId: string; direction: "up" | "down" }) => {
            const response = await ky
                .put("/api/faq/categories/reorder", {
                    json: { categoryId, direction },
                })
                .json<{ data: FaqCategory[] }>()
            return response.data
        },
        onMutate: async ({ categoryId, direction }: { categoryId: string; direction: "up" | "down" }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            if (previousCategories) {
                const currentIndex = previousCategories.findIndex((cat) => cat.id === categoryId)
                const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

                if (newIndex >= 0 && newIndex < previousCategories.length) {
                    const newCategories = [...previousCategories]
                    const temp = newCategories[currentIndex].sort_order
                    newCategories[currentIndex].sort_order = newCategories[newIndex].sort_order
                    newCategories[newIndex].sort_order = temp
                    newCategories.sort((a, b) => a.sort_order - b.sort_order)

                    queryClient.setQueryData(["faq-categories", restaurantId], newCategories)
                }
            }

            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_reorder_faq_category"))
        },
        onSuccess: () => {
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}

export function useCreateFaq(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")

    return useMutation({
        mutationFn: async (data: {
            category_id: string
            question: string
            answer: string
            is_featured?: boolean
        }) => {
            const response = await ky.post("/api/faq/items", { json: data }).json<{ data: Faq }>()
            return response.data
        },
        onMutate: async (variables: {
            category_id: string
            question: string
            answer: string
            is_featured?: boolean
        }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            const optimisticFaq: Faq = {
                id: `temp-${Date.now()}`,
                category_id: variables.category_id,
                question: variables.question,
                answer: variables.answer,
                is_featured: variables.is_featured || false,
                view_count: 0,
                sort_order: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            queryClient.setQueryData<FaqCategoryWithFaqs[]>(
                ["faq-categories", restaurantId],
                (old) =>
                    old?.map((cat) =>
                        cat.id === variables.category_id
                            ? {
                                ...cat,
                                faqs: [
                                    ...cat.faqs,
                                    {
                                        ...optimisticFaq,
                                        sort_order:
                                            !cat.faqs || cat.faqs.length === 0 ? 0 : Math.max(...cat.faqs.map((f) => f.sort_order)) + 1,
                                    },
                                ],
                            }
                            : cat,
                    ) || [],
            )

            return { previousCategories, optimisticFaq }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_add_faq"))
        },
        onSuccess: () => {
            toast.success(t("success.faq_added_successfully"))
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}

export function useUpdateFaq(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")

    return useMutation({
        mutationFn: async ({
            id,
            ...data
        }: {
            id: string
            question: string
            answer: string
            is_featured?: boolean
        }) => {
            const response = await ky.put(`/api/faq/items/${id}`, { json: data }).json<{ data: Faq }>()
            return response.data
        },
        onMutate: async (variables: {
            id: string
            question: string
            answer: string
            is_featured?: boolean
        }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            queryClient.setQueryData<FaqCategoryWithFaqs[]>(
                ["faq-categories", restaurantId],
                (old) =>
                    old?.map((cat) => ({
                        ...cat,
                        faqs: cat.faqs.map((faq) =>
                            faq.id === variables.id
                                ? {
                                    ...faq,
                                    question: variables.question,
                                    answer: variables.answer,
                                    is_featured: variables.is_featured || false,
                                }
                                : faq,
                        ),
                    })) || [],
            )

            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_update_faq"))
        },
        onSuccess: () => {
            toast.success(t("success.faq_updated_successfully"))
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}

export function useDeleteFaq(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")

    return useMutation({
        mutationFn: async (id: string) => {
            await ky.delete(`/api/faq/items/${id}`)
            return id
        },
        onMutate: async (deletedId: string) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            queryClient.setQueryData<FaqCategoryWithFaqs[]>(
                ["faq-categories", restaurantId],
                (old) =>
                    old?.map((cat) => ({
                        ...cat,
                        faqs: cat.faqs.filter((faq) => faq.id !== deletedId),
                    })) || [],
            )

            return { previousCategories }
        },
        onError: (err, deletedId, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_delete_faq"))
        },
        onSuccess: () => {
            toast.success(t("success.faq_deleted_successfully"))
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}

export function useReorderFaq(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("faq_api_client")

    return useMutation({
        mutationFn: async ({ faqId, direction }: { faqId: string; direction: "up" | "down" }) => {
            const response = await ky
                .put("/api/faq/items/reorder", {
                    json: { faqId, direction },
                })
                .json<{ data: Faq[] }>()
            return response.data
        },
        onMutate: async ({ faqId, direction }: { faqId: string; direction: "up" | "down" }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["faq-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<FaqCategoryWithFaqs[]>(["faq-categories", restaurantId])

            if (previousCategories) {
                const newCategories = previousCategories.map((cat) => {
                    const faqIndex = cat.faqs.findIndex((faq) => faq.id === faqId)
                    if (faqIndex === -1) return cat

                    const newIndex = direction === "up" ? faqIndex - 1 : faqIndex + 1
                    if (newIndex < 0 || newIndex >= cat.faqs.length) return cat

                    const newFaqs = [...cat.faqs]
                    const temp = newFaqs[faqIndex].sort_order
                    newFaqs[faqIndex].sort_order = newFaqs[newIndex].sort_order
                    newFaqs[newIndex].sort_order = temp
                    newFaqs.sort((a, b) => a.sort_order - b.sort_order)

                    return { ...cat, faqs: newFaqs }
                })

                queryClient.setQueryData(["faq-categories", restaurantId], newCategories)
            }

            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["faq-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_reorder_faq"))
        },
        onSuccess: () => {
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["faq-categories", restaurantId] })
            }
        },
    })
}
