import prisma from "@/lib/prisma"
import { getReorderItemSchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
    const t = await getTranslations("menu_apis.items.errors")

    try {
        const body = await request.json()
        const reorderItemSchema = await getReorderItemSchema()
        const { itemId, direction } = reorderItemSchema.parse(body)

        // Get the current item
        const currentItem = await prisma.menuItem.findUnique({
            where: { id: itemId },
        })

        if (!currentItem) {
            return NextResponse.json({ error: t("item_not_found") }, { status: 404 })
        }

        // Get all items in this category ordered by sort_order
        const allItems = await prisma.menuItem.findMany({
            where: { category_id: currentItem.category_id },
            orderBy: { sort_order: "asc" },
        })

        const currentIndex = allItems.findIndex((item) => item.id === itemId)
        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        // Check bounds
        if (newIndex < 0 || newIndex >= allItems.length) {
            return NextResponse.json({ error: t("cannot_move_item") }, { status: 400 })
        }

        // Swap sort orders
        const itemToSwap = allItems[newIndex]

        await prisma.$transaction([
            prisma.menuItem.update({
                where: { id: itemId },
                data: { sort_order: itemToSwap.sort_order },
            }),
            prisma.menuItem.update({
                where: { id: itemToSwap.id },
                data: { sort_order: currentItem.sort_order },
            }),
        ])

        // Return updated items
        const updatedItems = await prisma.menuItem.findMany({
            where: { category_id: currentItem.category_id },
            orderBy: { sort_order: "asc" },
        })

        return NextResponse.json({ data: updatedItems })
    } catch (error) {
        console.error("Error reordering item:", error)
        return NextResponse.json({ error: t("failed_to_reorder") }, { status: 500 })
    }
}
