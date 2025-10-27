import { checkAuth } from "@/lib/auth/utils"
import { getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"

export async function GET() {
    const t = await getTranslations("subscription_api")
    try {

        const user_session = await checkAuth()

        if (!user_session) {
            return NextResponse.json({ error: t("errors.authentication_required") }, { status: 401 })
        }

        if (!user_session?.user) {
            return NextResponse.json({ error: t("errors.user_not_found") }, { status: 404 })
        }

        return NextResponse.json({
            plan: user_session?.user.subscription_plan || "basic",
            status: user_session?.user.subscription_status || "active",
            current_period_end: user_session?.user.subscription_current_period_end,
            stripe_customer_id: user_session?.user.stripe_customer_id,
        })
    } catch (error) {
        console.error("Subscription fetch error:", error)
        return NextResponse.json({ error: t("errors.failed_fetch_subscription") }, { status: 500 })
    }
}
