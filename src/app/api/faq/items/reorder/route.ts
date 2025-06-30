import { type NextRequest, NextResponse } from "next/server"
import { reorderFaqSchema } from "@/lib/faq-validations"
import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { faqId, direction } = reorderFaqSchema.parse(body)

        // Get the FAQ to check ownership
        const faq = await prisma.faq.findUnique({
            where: { id: faqId },
            include: {
                category: true,
            },
        })

        if (!faq) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(faq.category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        // Get all FAQs for this category
        const faqs = await prisma.faq.findMany({
            where: { category_id: faq.category_id },
            orderBy: { sort_order: "asc" },
        })

        const currentIndex = faqs.findIndex((f) => f.id === faqId)
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= faqs.length) {
            return NextResponse.json({ error: "Cannot move FAQ in that direction" }, { status: 400 })
        }

        // Swap sort orders
        const currentFaq = faqs[currentIndex]
        const targetFaq = faqs[targetIndex]

        await prisma.$transaction([
            prisma.faq.update({
                where: { id: currentFaq.id },
                data: { sort_order: targetFaq.sort_order },
            }),
            prisma.faq.update({
                where: { id: targetFaq.id },
                data: { sort_order: currentFaq.sort_order },
            }),
        ])

        // Return updated FAQs
        const updatedFaqs = await prisma.faq.findMany({
            where: { category_id: faq.category_id },
            orderBy: { sort_order: "asc" },
        })

        return NextResponse.json({ data: updatedFaqs })
    } catch (error) {
        console.error("Error reordering FAQ:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
