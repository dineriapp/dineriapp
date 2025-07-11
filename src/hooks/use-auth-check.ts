import { supabase } from "@/supabase/clients/client"
import { useEffect, useState } from "react"

export function useAuthCheck() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession()
            setIsAuthenticated(!!data.session?.user)
        }

        checkSession()

        // Optional: listen to auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsAuthenticated(!!session?.user)
            }
        )

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    return isAuthenticated
}