import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { updateCategorySchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json()
        const { id } = await params
        const categoryId = id

        const validated = updateCategorySchema.parse(body)


        // First get the category to check ownership
        const existingCategory = await prisma.menuCategory.findUnique({
            where: { id: categoryId },
        })

        if (!existingCategory) {
            return NextResponse.json({ error: "Menu category not found" }, { status: 404 })
        }

        // Authenticate user and verify restaurant ownership
        const authResult = await authenticateAndAuthorize(existingCategory.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const category = await prisma.menuCategory.update({
            where: { id: categoryId },
            data: validated,
            include: {
                items: {
                    orderBy: {
                        sort_order: "asc",
                    },
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
        const categoryId = id

        // First get the category to check ownership
        const existingCategory = await prisma.menuCategory.findUnique({
            where: { id: categoryId },
        })

        if (!existingCategory) {
            return NextResponse.json({ error: "Menu category not found" }, { status: 404 })
        }

        // Authenticate user and verify restaurant ownership
        const authResult = await authenticateAndAuthorize(existingCategory.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        // Delete all menu items in this category first (cascade delete)
        await prisma.menuItem.deleteMany({
            where: { category_id: categoryId },
        })

        // Then delete the category
        await prisma.menuCategory.delete({
            where: { id: categoryId },
        })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error("Error deleting category:", error)
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }
}
