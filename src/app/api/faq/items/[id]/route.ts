import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateFaqSchema } from "@/lib/faq-validations"
import { authenticateAndAuthorize } from "@/lib/auth-utils"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const faqId = id

        const validated = updateFaqSchema.parse(body)

        // First get the FAQ to check ownership
        const existingFaq = await prisma.faq.findUnique({
            where: { id: faqId },
            include: {
                category: true,
            },
        })

        if (!existingFaq) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(existingFaq.category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const faq = await prisma.faq.update({
            where: { id: faqId },
            data: validated,
        })

        return NextResponse.json({ data: faq })
    } catch (error) {
        console.error("Error updating FAQ:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const faqId = id

        // First get the FAQ to check ownership
        const existingFaq = await prisma.faq.findUnique({
            where: { id: faqId },
            include: {
                category: true,
            },
        })

        if (!existingFaq) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(existingFaq.category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        await prisma.faq.delete({
            where: { id: faqId },
        })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error("Error deleting FAQ:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
