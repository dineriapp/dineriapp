import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { customStorage } from './storage'
import { RestaurantWithCount } from '@/types'

interface RestaurantState {
    restaurants: RestaurantWithCount[]
    selectedRestaurant: RestaurantWithCount | null
    setRestaurants: (restaurants: RestaurantWithCount[]) => void
    setSelectedRestaurant: (restaurant: RestaurantWithCount, options?: { refresh: boolean }) => void
    updateSelectedRestaurant: (updates: Partial<RestaurantWithCount>) => void
    initializeRestaurants: (data: RestaurantWithCount[]) => void
}

export const useRestaurantStore = create<RestaurantState>()(
    persist(
        (set, get) => ({
            restaurants: [],
            selectedRestaurant: null,
            setRestaurants: (restaurants) => set({ restaurants }),
            setSelectedRestaurant: (restaurant, options = { refresh: false }) => {
                console.log({ restaurant });
                set({ selectedRestaurant: restaurant })
                localStorage.setItem("selected-restaurant-id", restaurant.id);
                // Force a full page reload
                if (options.refresh) {
                    window.location.reload();
                }
            },
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
            initializeRestaurants: (data) => {
                set({ restaurants: data });

                const storedId = localStorage.getItem("selected-restaurant-id");
                const firstRestaurant = data[0];

                let selected = null;

                if (storedId) {
                    selected = data.find((r) => r.id === storedId);
                }

                // Always use fresh object from backend
                const finalRestaurant = selected || firstRestaurant || null;

                set({ selectedRestaurant: finalRestaurant });

                if (finalRestaurant) {
                    localStorage.setItem("selected-restaurant-id", finalRestaurant.id);
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