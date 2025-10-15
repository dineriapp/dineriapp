import { authenticateAndAuthorize } from "@/lib/auth-utils"
import { getReorderFaqCategorySchema } from "@/lib/faq-validations"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
    const t = await getTranslations("faq_apis_categories")

    try {
        const body = await request.json()
        const reorderFaqCategorySchema = await getReorderFaqCategorySchema()
        const { categoryId, direction } = reorderFaqCategorySchema.parse(body)

        // Get the category to check ownership
        const category = await prisma.faqCategory.findUnique({
            where: { id: categoryId },
        })

        if (!category) {
            return NextResponse.json({ error: t("error_faq_category_not_found") }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        // Get all categories for this restaurant
        const categories = await prisma.faqCategory.findMany({
            where: { restaurant_id: category.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        const currentIndex = categories.findIndex((cat) => cat.id === categoryId)
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= categories.length) {
            return NextResponse.json({ error: t("error_cannot_move_direction") }, { status: 400 })
        }

        // Swap sort orders
        const currentCategory = categories[currentIndex]
        const targetCategory = categories[targetIndex]

        await prisma.$transaction([
            prisma.faqCategory.update({
                where: { id: currentCategory.id },
                data: { sort_order: targetCategory.sort_order },
            }),
            prisma.faqCategory.update({
                where: { id: targetCategory.id },
                data: { sort_order: currentCategory.sort_order },
            }),
        ])

        // Return updated categories
        const updatedCategories = await prisma.faqCategory.findMany({
            where: { restaurant_id: category.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        return NextResponse.json({ data: updatedCategories })
    } catch (error) {
        console.error("Error reordering FAQ category:", error)
        return NextResponse.json({ error: t("error_internal_server_error") }, { status: 500 })
    }
}
