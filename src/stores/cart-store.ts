import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
    id: string
    name: string
    description?: string
    price: number
    quantity: number
    category: string
    allergens?: string[]
    is_halal?: boolean
    addons?: { name: string, price: number }[]
    image_url?: string
    cartItemId: string
}

interface CartState {
    items: Record<string, CartItem[]> // keyed by restaurant slug
    addItem: (restaurantSlug: string, item: Omit<CartItem, "quantity">) => void
    removeItem: (restaurantSlug: string, itemId: string) => void
    updateQuantity: (restaurantSlug: string, itemId: string, quantity: number) => void
    clearCart: () => void
    getCartItems: (restaurantSlug: string) => CartItem[]
    getCartTotal: (restaurantSlug: string) => number
    getCartItemCount: (restaurantSlug: string) => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: {},

            addItem: (restaurantSlug, item) => {
                set((state) => {
                    const restaurantItems = state.items[restaurantSlug] || []

                    const newAddonsKey = JSON.stringify(
                        (item.addons || []).sort((a, b) => a.name.localeCompare(b.name))
                    )

                    const existingItemIndex = restaurantItems.findIndex((i) => {
                        const existingAddonsKey = JSON.stringify(
                            (i.addons || []).sort((a, b) => a.name.localeCompare(b.name))
                        )
                        return i.id === item.id && existingAddonsKey === newAddonsKey
                    })

                    if (existingItemIndex >= 0) {
                        restaurantItems[existingItemIndex].quantity += 1
                    } else {
                        restaurantItems.push({
                            ...item,
                            quantity: 1,
                        })
                    }

                    return {
                        items: {
                            ...state.items,
                            [restaurantSlug]: restaurantItems,
                        },
                    }
                })
            },

            removeItem: (restaurantSlug, cartItemId) => {
                set((state) => {
                    const restaurantItems = state.items[restaurantSlug] || []
                    return {
                        items: {
                            ...state.items,
                            [restaurantSlug]: restaurantItems.filter((item) => item.cartItemId !== cartItemId),
                        },
                    }
                })
            },

            updateQuantity: (restaurantSlug, cartItemId, quantity) => {
                set((state) => {
                    const restaurantItems = state.items[restaurantSlug] || []
                    const updatedItems = restaurantItems
                        .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item))
                        .filter((item) => item.quantity > 0)

                    return {
                        items: {
                            ...state.items,
                            [restaurantSlug]: updatedItems,
                        },
                    }
                })
            },

            clearCart: () => {
                set({ items: {} })
            },


            getCartItems: (restaurantSlug) => {
                return get().items[restaurantSlug] || []
            },
            getCartTotal: (restaurantSlug) => {
                const items = get().items[restaurantSlug] || []

                return items.reduce((total, item) => {
                    const addonsTotal = Array.isArray(item.addons)
                        ? item.addons.reduce((sum, addon) => sum + addon.price, 0)
                        : 0

                    return total + (item.price + addonsTotal) * item.quantity
                }, 0)
            },

            getCartItemCount: (restaurantSlug) => {
                const items = get().items[restaurantSlug] || []
                return items.reduce((count, item) => count + item.quantity, 0)
            },
        }),
        {
            name: "restaurant-cart-storage",
        },
    ),
)
