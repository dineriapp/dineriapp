import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { customStorage } from './storage'
import { RestaurantWithCount } from '@/types'

interface RestaurantState {
    restaurants: RestaurantWithCount[]
    selectedRestaurant: RestaurantWithCount | null
    setRestaurants: (restaurants: RestaurantWithCount[]) => void
    setSelectedRestaurant: (restaurant: RestaurantWithCount) => void
    updateSelectedRestaurant: (updates: Partial<RestaurantWithCount>) => void
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