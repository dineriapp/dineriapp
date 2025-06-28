import { create } from 'zustand'

interface UpgradePopupState {
    isOpen: boolean
    message: string
    open: (message?: string) => void
    close: () => void
}

export const useUpgradePopupStore = create<UpgradePopupState>((set) => ({
    isOpen: false,
    message: "You've reached your plan limit. Upgrade to access more features.",
    open: (message) => set({ isOpen: true, message: message || "You've reached your plan limit. Upgrade to access more features." }),
    close: () => set({ isOpen: false }),
}))