import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"

export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        const dbUser = await prisma.user.findFirst({
            where: { supabase_id: user.id },
            select: {
                subscription_plan: true,
                subscription_status: true,
                subscription_current_period_end: true,
                stripe_customer_id: true,
            },
        })

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({
            plan: dbUser.subscription_plan || "basic",
            status: dbUser.subscription_status || "active",
            current_period_end: dbUser.subscription_current_period_end,
            stripe_customer_id: dbUser.stripe_customer_id,
        })
    } catch (error) {
        console.error("Subscription fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }
}
