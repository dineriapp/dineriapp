import { authenticateAndAuthorize, checkSubscriptionLimitsWithPlans } from "@/lib/auth-utils"
import { createFaqSchema } from "@/lib/faq-validations"
import prisma from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validated = createFaqSchema.parse(body)

        // First get the category to check ownership
        const category = await prisma.faqCategory.findUnique({
            where: { id: validated.category_id },
        })

        if (!category) {
            return NextResponse.json({ error: "FAQ category not found" }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user, restaurant } = authResult.data!

        // Check subscription limits for FAQs per category
        const limitResult = await checkSubscriptionLimitsWithPlans(user.id, restaurant.id, "faqs", validated.category_id)
        if (limitResult.error) {
            return NextResponse.json({ error: limitResult.error }, { status: limitResult.status || 500 })
        }

        // Get the next sort order
        const lastFaq = await prisma.faq.findFirst({
            where: { category_id: validated.category_id },
            orderBy: { sort_order: "desc" },
        })

        const nextSortOrder = lastFaq ? lastFaq.sort_order + 1 : 0

        const faq = await prisma.faq.create({
            data: {
                ...validated,
                sort_order: nextSortOrder,
            },
        })

        return NextResponse.json({ data: faq }, { status: 201 })
    } catch (error) {
        console.error("Error creating FAQ:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
