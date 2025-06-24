import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/supabase/clients/client'
import { Restaurant } from '@/lib/types'

interface RestaurantState {
    restaurants: Restaurant[]
    currentRestaurantId: string | null
    isLoading: boolean
    error: string | null
}

interface RestaurantActions {
    fetchRestaurants: (userId: string) => Promise<void>
    setCurrentRestaurant: (restaurantId: string) => void
}

type RestaurantStore = RestaurantState & RestaurantActions

const initialState: RestaurantState = {
    restaurants: [],
    currentRestaurantId: null,
    isLoading: false,
    error: null
}

export const useRestaurantStore = create<RestaurantStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            fetchRestaurants: async (userId: string) => {
                set({ isLoading: true, error: null })
                try {
                    const { data, error } = await supabase
                        .from('restaurants')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })

                    if (error) throw error

                    // Set current restaurant if not set
                    const currentState = get()
                    let currentId = currentState.currentRestaurantId

                    if (!currentId || !data?.some(r => r.id === currentId)) {
                        currentId = data?.[0]?.id || null
                    }

                    set({
                        restaurants: data || [],
                        currentRestaurantId: currentId,
                        isLoading: false
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch restaurants',
                        isLoading: false
                    })
                }
            },

            setCurrentRestaurant: (restaurantId) => {
                set({ currentRestaurantId: restaurantId })
            }
        }),
        {
            name: 'restaurant-storage',
            partialize: (state) => ({
                currentRestaurantId: state.currentRestaurantId
            })
        }
    )
)