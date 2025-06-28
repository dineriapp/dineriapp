import prisma from "@/lib/prisma"
import { reorderItemSchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { itemId, direction } = reorderItemSchema.parse(body)

        // Get the current item
        const currentItem = await prisma.menuItem.findUnique({
            where: { id: itemId },
        })

        if (!currentItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 })
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
            return NextResponse.json({ error: "Cannot move item in that direction" }, { status: 400 })
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
        return NextResponse.json({ error: "Failed to reorder item" }, { status: 500 })
    }
}
