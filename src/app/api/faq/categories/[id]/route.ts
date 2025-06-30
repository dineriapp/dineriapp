import { type NextRequest, NextResponse } from "next/server"
import { updateFaqCategorySchema } from "@/lib/faq-validations"
import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const categoryId = id

        const validated = updateFaqCategorySchema.parse(body)

        // First get the category to check ownership
        const existingCategory = await prisma.faqCategory.findUnique({
            where: { id: categoryId },
        })

        if (!existingCategory) {
            return NextResponse.json({ error: "FAQ category not found" }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(existingCategory.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const category = await prisma.faqCategory.update({
            where: { id: categoryId },
            data: validated,
            include: {
                faqs: {
                    orderBy: {
                        sort_order: "asc",
                    },
                },
            },
        })

        return NextResponse.json({ data: category })
    } catch (error) {
        console.error("Error updating FAQ category:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const categoryId = id

        // First get the category to check ownership
        const existingCategory = await prisma.faqCategory.findUnique({
            where: { id: categoryId },
        })

        if (!existingCategory) {
            return NextResponse.json({ error: "FAQ category not found" }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(existingCategory.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        // Delete all FAQs in this category first (cascade delete)
        await prisma.faq.deleteMany({
            where: { category_id: categoryId },
        })

        // Then delete the category
        await prisma.faqCategory.delete({
            where: { id: categoryId },
        })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error("Error deleting FAQ category:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
