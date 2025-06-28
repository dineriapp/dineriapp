'use client'

// Safe localStorage access with Next.js compatibility
export const customStorage = {
    getItem: async (name: string): Promise<string | null> => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(name)
        }
        return null
    },
    setItem: async (name: string, value: string): Promise<void> => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(name, value)
        }
    },
    removeItem: async (name: string): Promise<void> => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(name)
        }
    },
}