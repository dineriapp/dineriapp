import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/supabase/clients/server"

export async function POST() {
    try {
        // Authenticate user
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        // Get user from database
        const dbUser = await prisma.user.findFirst({
            where: { supabase_id: user.id },
        })

        if (!dbUser || !dbUser.stripe_customer_id) {
            return NextResponse.json({ error: "No subscription found" }, { status: 404 })
        }

        // Create customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: dbUser.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings/subscription`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error("Customer portal error:", error)
        return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
    }
}
