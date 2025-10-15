import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const t = await getTranslations("faq_apis_items.track_view")
    try {
        const { faqId } = await request.json()

        if (!faqId) {
            return NextResponse.json({ error: t("faq_id_required") }, { status: 400 })
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
        return NextResponse.json({ error: t("failed_to_track") }, { status: 500 })
    }
}
