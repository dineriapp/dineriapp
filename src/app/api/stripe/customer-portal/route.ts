import { checkAuth } from "@/lib/auth/utils"
import { stripe } from "@/lib/stripe"
import { getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"

export async function POST() {
    const t = await getTranslations("customer_portal_api")
    try {
        // Authenticate user
        const user_session = await checkAuth()

        if (!user_session?.user) {
            return NextResponse.json({ error: t("errors.authentication_required") }, { status: 401 })
        }

        if (!user_session?.user || !user_session?.user.stripe_customer_id) {
            return NextResponse.json({ error: t("errors.no_subscription_found") }, { status: 404 })
        }

        // Create customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user_session?.user.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings/subscription`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error("Customer portal error:", error)
        return NextResponse.json({ error: t("errors.failed_create_portal_session") }, { status: 500 })
    }
}
