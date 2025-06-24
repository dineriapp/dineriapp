import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/supabase/clients/client'
import { Session } from '@supabase/supabase-js'

interface AuthState {
    session: Session | null
    isLoading: boolean
    error: string | null
}

interface AuthActions {
    initialize: (session: Session) => void
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set) => ({
            session: null,
            isLoading: false,
            error: null,

            initialize: (session) => set({ session }),

            signOut: async () => {
                set({ isLoading: true })
                try {
                    const { error } = await supabase.auth.signOut()
                    if (error) throw error
                    set({ session: null, isLoading: false })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Sign out failed',
                        isLoading: false
                    })
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ session: state.session })
        }
    )
)