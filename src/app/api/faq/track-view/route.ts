import prisma from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { faqId } = await request.json()

        if (!faqId) {
            return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 })
        }

        // Increment the view count for the FAQ
        await prisma.faq.update({
            where: { id: faqId },
            data: {
                view_count: {
                    increment: 1,
                },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error tracking FAQ view:", error)
        return NextResponse.json({ error: "Failed to track FAQ view" }, { status: 500 })
    }
}
