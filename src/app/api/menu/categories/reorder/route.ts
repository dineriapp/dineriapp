import prisma from "@/lib/prisma"
import { getReorderMenuCategorySchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
    const t = await getTranslations("menu_apis.categories.errors")

    try {
        const body = await request.json()
        const reorderCategorySchema = await getReorderMenuCategorySchema()
        const { categoryId, direction } = reorderCategorySchema.parse(body)

        // Get the current category
        const currentCategory = await prisma.menuCategory.findUnique({
            where: { id: categoryId },
        })

        if (!currentCategory) {
            return NextResponse.json({ error: t("category_not_found") }, { status: 404 })
        }

        // Get all categories for this restaurant ordered by sort_order
        const allCategories = await prisma.menuCategory.findMany({
            where: { restaurant_id: currentCategory.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        const currentIndex = allCategories.findIndex((cat) => cat.id === categoryId)
        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        // Check bounds
        if (newIndex < 0 || newIndex >= allCategories.length) {
            return NextResponse.json({ error: t("cannot_move_category_direction") }, { status: 400 })
        }

        // Swap sort orders
        const categoryToSwap = allCategories[newIndex]

        await prisma.$transaction([
            prisma.menuCategory.update({
                where: { id: categoryId },
                data: { sort_order: categoryToSwap.sort_order },
            }),
            prisma.menuCategory.update({
                where: { id: categoryToSwap.id },
                data: { sort_order: currentCategory.sort_order },
            }),
        ])

        // Return updated categories
        const updatedCategories = await prisma.menuCategory.findMany({
            where: { restaurant_id: currentCategory.restaurant_id },
            orderBy: { sort_order: "asc" },
            include: {
                items: {
                    orderBy: { sort_order: "asc" },
                },
            },
        })

        return NextResponse.json({ data: updatedCategories })
    } catch (error) {
        console.error("Error reordering category:", error)
        return NextResponse.json({ error: t("failed_to_reorder") }, { status: 500 })
    }
}
