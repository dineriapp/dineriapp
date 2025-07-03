import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const restaurantId = id

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
        }

        const forwardedFor = request.headers.get("x-forwarded-for")
        const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
        const userAgent = request.headers.get("user-agent") || ""

        await prisma.restaurantView.create({
            data: {
                restaurant_id: restaurantId,
                ip_hash: ip,
                user_agent: userAgent,
            },
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Error tracking restaurant view:", err)
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
    }
}
