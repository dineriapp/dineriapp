import prisma from "@/lib/prisma"
import { updateCategorySchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const body = await request.json()
        const validated = updateCategorySchema.parse(body)

        const category = await prisma.menuCategory.update({
            where: { id: id },
            data: {
                name: validated.name.trim(),
                description: validated.description?.trim(),
            },
            include: {
                items: {
                    orderBy: { sort_order: "asc" },
                },
            },
        })

        return NextResponse.json({ data: category })
    } catch (error) {
        console.error("Error updating category:", error)
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params
        // Delete all menu items in this category first (cascade delete)
        await prisma.menuItem.deleteMany({
            where: { category_id: id },
        })

        // Then delete the category
        await prisma.menuCategory.delete({
            where: { id: id },
        })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error("Error deleting category:", error)
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }
}
