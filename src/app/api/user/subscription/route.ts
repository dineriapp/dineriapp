import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"
import { getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"

export async function GET() {
    const t = await getTranslations("subscription_api")
    try {

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: t("errors.authentication_required") }, { status: 401 })
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
            return NextResponse.json({ error: t("errors.user_not_found") }, { status: 404 })
        }

        return NextResponse.json({
            plan: dbUser.subscription_plan || "basic",
            status: dbUser.subscription_status || "active",
            current_period_end: dbUser.subscription_current_period_end,
            stripe_customer_id: dbUser.stripe_customer_id,
        })
    } catch (error) {
        console.error("Subscription fetch error:", error)
        return NextResponse.json({ error: t("errors.failed_fetch_subscription") }, { status: 500 })
    }
}
