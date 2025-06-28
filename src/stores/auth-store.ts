import { User as PrismaUser } from '@/generated/prisma'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import { customStorage } from './storage'

interface UserState {
    supabaseUser: User | null
    prismaUser: PrismaUser | null
    setSupabaseUser: (user: User) => void
    setPrismaUser: (user: PrismaUser) => void
    clearUser: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            supabaseUser: null,
            prismaUser: null,
            setSupabaseUser: (user) => set({ supabaseUser: user }),
            setPrismaUser: (user) => set({ prismaUser: user }),
            clearUser: () => set({ supabaseUser: null, prismaUser: null }),
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => customStorage),
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(
                        ([key]) => !['hydrated'].includes(key)
                    )
                ) as UserState,
        }
    )
)

// Hydration utility
export const useUserStoreHydrated = () => {
    const _ = useUserStore(state => (state as any).hydrated)
    console.log(_)
    return useUserStore(state => state)
}