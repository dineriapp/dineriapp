import { Restaurant } from '@/generated/prisma'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { customStorage } from './storage'

interface RestaurantState {
    restaurants: Restaurant[]
    selectedRestaurant: Restaurant | null
    setRestaurants: (restaurants: Restaurant[]) => void
    setSelectedRestaurant: (restaurant: Restaurant) => void
}

export const useRestaurantStore = create<RestaurantState>()(
    persist(
        (set) => ({
            restaurants: [],
            selectedRestaurant: null,
            setRestaurants: (restaurants) => set({ restaurants }),
            setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
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