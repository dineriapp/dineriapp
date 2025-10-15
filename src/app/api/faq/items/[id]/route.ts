import { authenticateAndAuthorize } from "@/lib/auth-utils"
import { getUpdateFaqSchema } from "@/lib/faq-validations"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("faq_apis_items.errors")

    try {
        const { id } = await params
        const body = await request.json()
        const faqId = id

        const updateFaqSchema = await getUpdateFaqSchema()

        const validated = updateFaqSchema.parse(body)

        // First get the FAQ to check ownership
        const existingFaq = await prisma.faq.findUnique({
            where: { id: faqId },
            include: {
                category: true,
            },
        })

        if (!existingFaq) {
            return NextResponse.json({ error: t("not_found") }, { status: 404 })
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
        return NextResponse.json({ error: t("internal_error") }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("faq_apis_items.errors")
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
            return NextResponse.json({ error: t("not_found") }, { status: 404 })
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
        return NextResponse.json({ error: t("not_found") }, { status: 500 })
    }
}
