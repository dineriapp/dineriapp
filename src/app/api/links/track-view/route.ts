import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const t = await getTranslations("links_apis.errors")

    try {
        const { linkId } = await request.json()

        if (!linkId) {
            return NextResponse.json({ error: t("link_id_required") }, { status: 400 })
        }

        // Get IP address and user agent for tracking
        const forwardedFor = request.headers.get("x-forwarded-for")
        const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"

        const userAgent = request.headers.get("user-agent") || ""

        // Create a link view record
        await prisma.linkView.create({
            data: {
                link_id: linkId,
                ip_hash: ip,
                user_agent: userAgent,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error tracking link view:", error)
        return NextResponse.json({ error: t("failed_to_track_view") }, { status: 500 })
    }
}
