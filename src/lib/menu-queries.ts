import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ky from "./ky"
import { toast } from "sonner"
import type { MenuCategory, MenuItem } from "@prisma/client"
import { useTranslations } from "next-intl"

// Use Prisma types with relations
type MenuCategoryWithItems = MenuCategory & {
    items: MenuItem[]
}

export function useMenuCategories(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["menu-categories", restaurantId],
        queryFn: async () => {
            if (!restaurantId) return []
            const response = await ky
                .get(`/api/menu/categories?restaurant_id=${restaurantId}`)
                .json<{ data: MenuCategoryWithItems[] }>()
            return response.data
        },
        enabled: !!restaurantId,
        staleTime: 60 * 1000,
    })
}

export function useCreateCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")
    return useMutation({
        mutationFn: async (data: { name: string; description?: string, show_in_quick_menu?: boolean }) => {
            if (!restaurantId) throw new Error(t("errors.restaurant_id_required"))

            const response = await ky
                .post("/api/menu/categories", {
                    json: { ...data, restaurant_id: restaurantId, show_in_quick_menu: data.show_in_quick_menu || false },
                })
                .json<{ data: MenuCategoryWithItems }>()
            return response.data
        },
        onMutate: async (newCategory: { name: string; description?: string }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            const optimisticCategory: MenuCategoryWithItems = {
                id: `temp-${Date.now()}`,
                restaurant_id: restaurantId,
                show_in_quick_menu: false,
                name: newCategory.name,
                description: newCategory.description || null,
                sort_order:
                    previousCategories && previousCategories.length > 0
                        ? Math.max(...previousCategories.map((c) => c.sort_order)) + 1
                        : 0,
                items: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            queryClient.setQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId], (old) =>
                old ? [...old, optimisticCategory] : [optimisticCategory],
            )

            return { previousCategories, optimisticCategory }
        },
        onError: (err, newCategory, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_add_category"))
        },
        onSuccess: () => {
            toast.success(t("success.category_added_successfully"))
            // Force refetch to ensure fresh data
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}

export function useUpdateCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; name: string; description?: string, show_in_quick_menu: boolean }) => {
            const response = await ky.put(`/api/menu/categories/${id}`, { json: { ...data, show_in_quick_menu: data.show_in_quick_menu } }).json<{ data: MenuCategory }>()
            return response.data
        },
        onMutate: async (variables: { id: string; name: string; description?: string }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            queryClient.setQueryData<MenuCategoryWithItems[]>(
                ["menu-categories", restaurantId],
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
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_update_category"))
        },
        onSuccess: () => {
            toast.success(t("success.category_updated_successfully"))
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}

export function useDeleteCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")

    return useMutation({
        mutationFn: async (id: string) => {
            await ky.delete(`/api/menu/categories/${id}`)
            return id
        },
        onMutate: async (deletedId: string) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            queryClient.setQueryData<MenuCategoryWithItems[]>(
                ["menu-categories", restaurantId],
                (old) => old?.filter((cat) => cat.id !== deletedId) || [],
            )

            return { previousCategories }
        },
        onError: (err, deletedId, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_delete_category"))
        },
        onSuccess: () => {
            toast.success(t("success.category_deleted_successfully"))
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}

export function useReorderCategory(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")

    return useMutation({
        mutationFn: async ({ categoryId, direction }: { categoryId: string; direction: "up" | "down" }) => {
            const response = await ky
                .put("/api/menu/categories/reorder", {
                    json: { categoryId, direction },
                })
                .json<{ data: MenuCategory[] }>()
            return response.data
        },
        onMutate: async ({ categoryId, direction }: { categoryId: string; direction: "up" | "down" }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            if (previousCategories) {
                const currentIndex = previousCategories.findIndex((cat) => cat.id === categoryId)
                const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

                if (newIndex >= 0 && newIndex < previousCategories.length) {
                    const newCategories = [...previousCategories]
                    const temp = newCategories[currentIndex].sort_order
                    newCategories[currentIndex].sort_order = newCategories[newIndex].sort_order
                    newCategories[newIndex].sort_order = temp
                    newCategories.sort((a, b) => a.sort_order - b.sort_order)

                    queryClient.setQueryData(["menu-categories", restaurantId], newCategories)
                }
            }

            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_reorder_category"))
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}

export function useCreateItem(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")

    return useMutation({
        mutationFn: async (data: {
            category_id: string
            name: string
            description?: string
            image?: string
            price: number
            allergens?: string[]
            is_halal?: boolean
            show_in_quick_menu: boolean
            addons?: { name: string, price: number }[]
            allergen_info?: string
        }) => {
            const response = await ky.post("/api/menu/items", { json: data }).json<{ data: MenuItem }>()
            return response.data
        },
        onMutate: async (variables: {
            category_id: string
            name: string
            description?: string
            image?: string
            price: number
            show_in_quick_menu: boolean
            allergens?: string[]
            is_halal?: boolean
            allergen_info?: string
            addons?: { name: string, price: number }[]
        }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            const optimisticItem: MenuItem = {
                id: `temp-${Date.now()}`,
                category_id: variables.category_id,
                image: variables.image || "",
                name: variables.name,
                show_in_quick_menu: variables.show_in_quick_menu,
                description: variables.description || null,
                price: variables.price,
                allergens: variables.allergens || [],
                is_halal: variables.is_halal || null,
                allergen_info: variables.allergen_info || null,
                sort_order: 0,
                addons: variables.addons ?? [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            queryClient.setQueryData<MenuCategoryWithItems[]>(
                ["menu-categories", restaurantId],
                (old) =>
                    old?.map((cat) =>
                        cat.id === variables.category_id
                            ? {
                                ...cat,
                                items: [
                                    ...cat.items,
                                    {
                                        ...optimisticItem,
                                        sort_order:
                                            cat.items && cat.items.length > 0 ? Math.max(...cat.items.map((i) => i.sort_order)) + 1 : 0,
                                    },
                                ],
                            }
                            : cat,
                    ) || [],
            )

            return { previousCategories, optimisticItem }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_add_menu_item"))
        },
        onSuccess: () => {
            toast.success(t("success.menu_item_added_successfully"))
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}

export function useUpdateItem(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")

    return useMutation({
        mutationFn: async ({
            id,
            ...data
        }: {
            id: string
            name: string
            image?: string
            description?: string
            price: number
            show_in_quick_menu: boolean
            allergens?: string[]
            is_halal?: boolean
            addons?: { name: string, price: number }[]
            allergen_info?: string
        }) => {
            const response = await ky.put(`/api/menu/items/${id}`, { json: data }).json<{ data: MenuItem }>()
            return response.data
        },
        onMutate: async (variables: {
            id: string
            name: string
            description?: string
            image?: string
            price: number
            allergens?: string[]
            is_halal?: boolean
            addons?: { name: string, price: number }[]
            allergen_info?: string
        }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            queryClient.setQueryData<MenuCategoryWithItems[]>(
                ["menu-categories", restaurantId],
                (old) =>
                    old?.map((cat) => ({
                        ...cat,
                        items: cat.items.map((item) =>
                            item.id === variables.id
                                ? {
                                    ...item,
                                    name: variables.name,
                                    description: variables.description || null,
                                    price: variables.price,
                                    image: variables.image || "",
                                    allergens: variables.allergens || [],
                                    is_halal: variables.is_halal || null,
                                    addons: variables.addons ?? [],
                                    allergen_info: variables.allergen_info || null,
                                }
                                : item,
                        ),
                    })) || [],
            )

            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_update_menu_item"))
        },
        onSuccess: () => {
            toast.success(t("success.menu_item_updated_successfully"))
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}

export function useDeleteItem(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")

    return useMutation({
        mutationFn: async (id: string) => {
            await ky.delete(`/api/menu/items/${id}`)
            return id
        },
        onMutate: async (deletedId: string) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            queryClient.setQueryData<MenuCategoryWithItems[]>(
                ["menu-categories", restaurantId],
                (old) =>
                    old?.map((cat) => ({
                        ...cat,
                        items: cat.items.filter((item) => item.id !== deletedId),
                    })) || [],
            )

            return { previousCategories }
        },
        onError: (err, deletedId, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_delete_menu_item"))
        },
        onSuccess: () => {
            toast.success(t("success.menu_item_deleted_successfully"))
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}

export function useReorderItem(restaurantId: string | undefined) {
    const queryClient = useQueryClient()
    const t = useTranslations("menu_api_client")

    return useMutation({
        mutationFn: async ({ itemId, direction }: { itemId: string; direction: "up" | "down" }) => {
            const response = await ky
                .put("/api/menu/items/reorder", {
                    json: { itemId, direction },
                })
                .json<{ data: MenuItem[] }>()
            return response.data
        },
        onMutate: async ({ itemId, direction }: { itemId: string; direction: "up" | "down" }) => {
            if (!restaurantId) return

            await queryClient.cancelQueries({ queryKey: ["menu-categories", restaurantId] })

            const previousCategories = queryClient.getQueryData<MenuCategoryWithItems[]>(["menu-categories", restaurantId])

            if (previousCategories) {
                const newCategories = previousCategories.map((cat) => {
                    const itemIndex = cat.items.findIndex((item) => item.id === itemId)
                    if (itemIndex === -1) return cat

                    const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1
                    if (newIndex < 0 || newIndex >= cat.items.length) return cat

                    const newItems = [...cat.items]
                    const temp = newItems[itemIndex].sort_order
                    newItems[itemIndex].sort_order = newItems[newIndex].sort_order
                    newItems[newIndex].sort_order = temp
                    newItems.sort((a, b) => a.sort_order - b.sort_order)

                    return { ...cat, items: newItems }
                })

                queryClient.setQueryData(["menu-categories", restaurantId], newCategories)
            }

            return { previousCategories }
        },
        onError: (err, variables, context) => {
            if (restaurantId && context?.previousCategories) {
                queryClient.setQueryData(["menu-categories", restaurantId], context.previousCategories)
            }
            toast.error(t("errors.failed_to_reorder_menu_item"))
        },
        onSettled: () => {
            if (restaurantId) {
                queryClient.invalidateQueries({ queryKey: ["menu-categories", restaurantId] })
            }
        },
    })
}
