import { Restaurant } from '@prisma/client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { customStorage } from './storage'

interface RestaurantState {
    restaurants: Restaurant[]
    selectedRestaurant: Restaurant | null
    setRestaurants: (restaurants: Restaurant[]) => void
    setSelectedRestaurant: (restaurant: Restaurant) => void
    updateSelectedRestaurant: (updates: Partial<Restaurant>) => void
}

export const useRestaurantStore = create<RestaurantState>()(
    persist(
        (set, get) => ({
            restaurants: [],
            selectedRestaurant: null,
            setRestaurants: (restaurants) => set({ restaurants }),
            setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
            updateSelectedRestaurant: (updates) => {
                const { selectedRestaurant } = get()
                if (selectedRestaurant) {
                    const updatedRestaurant = { ...selectedRestaurant, ...updates }
                    set({ selectedRestaurant: updatedRestaurant })

                    // Also update in restaurants array if it exists
                    const { restaurants } = get()
                    if (restaurants) {
                        const updatedRestaurants = restaurants.map((r) => (r.id === selectedRestaurant.id ? updatedRestaurant : r))
                        set({ restaurants: updatedRestaurants })
                    }
                }
            },
        }),
        {
            name: 'restaurant-store', // LocalStorage key
            storage: createJSONStorage(() => customStorage),
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(
                        ([key]) => !['hydrated'].includes(key)
                    )
                ) as RestaurantState,
        }
    )
)

export const useRestaurantStoreHydrated = () => {
    const hydrated = useRestaurantStore(state => (state as any).hydrated)
    return { ...useRestaurantStore(), hydrated }
}