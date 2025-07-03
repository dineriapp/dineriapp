import prisma from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { linkId } = await request.json()

        if (!linkId) {
            return NextResponse.json({ error: "Link ID is required" }, { status: 400 })
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
        return NextResponse.json({ error: "Failed to track link view" }, { status: 500 })
    }
}
