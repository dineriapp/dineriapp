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
    image_url?: string
}

interface CartState {
    items: Record<string, CartItem[]> // keyed by restaurant slug
    addItem: (restaurantSlug: string, item: Omit<CartItem, "quantity">) => void
    removeItem: (restaurantSlug: string, itemId: string) => void
    updateQuantity: (restaurantSlug: string, itemId: string, quantity: number) => void
    clearCart: (restaurantSlug: string) => void
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
                    const existingItemIndex = restaurantItems.findIndex((i) => i.id === item.id)

                    if (existingItemIndex >= 0) {
                        // Update quantity if item exists
                        restaurantItems[existingItemIndex].quantity += 1
                    } else {
                        // Add new item
                        restaurantItems.push({ ...item, quantity: 1 })
                    }

                    return {
                        items: {
                            ...state.items,
                            [restaurantSlug]: restaurantItems,
                        },
                    }
                })
            },

            removeItem: (restaurantSlug, itemId) => {
                set((state) => {
                    const restaurantItems = state.items[restaurantSlug] || []
                    return {
                        items: {
                            ...state.items,
                            [restaurantSlug]: restaurantItems.filter((item) => item.id !== itemId),
                        },
                    }
                })
            },

            updateQuantity: (restaurantSlug, itemId, quantity) => {
                set((state) => {
                    const restaurantItems = state.items[restaurantSlug] || []
                    const updatedItems = restaurantItems
                        .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item))
                        .filter((item) => item.quantity > 0)

                    return {
                        items: {
                            ...state.items,
                            [restaurantSlug]: updatedItems,
                        },
                    }
                })
            },

            clearCart: (restaurantSlug) => {
                set((state) => ({
                    items: {
                        ...state.items,
                        [restaurantSlug]: [],
                    },
                }))
            },

            getCartItems: (restaurantSlug) => {
                return get().items[restaurantSlug] || []
            },

            getCartTotal: (restaurantSlug) => {
                const items = get().items[restaurantSlug] || []
                return items.reduce((total, item) => total + item.price * item.quantity, 0)
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
