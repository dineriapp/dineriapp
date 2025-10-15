import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { formatUrl, getUpdateLinkSchema } from "@/lib/validations"
import { createClient } from "@/supabase/clients/server"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("links_apis.errors")

    try {
        const { id } = await params
        const body = await request.json()
        const updateLinkSchema = await getUpdateLinkSchema()
        const validated = updateLinkSchema.parse({
            ...body,
            url: formatUrl(body.url),
        })

        // First get the link to check ownership
        const existingLink = await prisma.link.findUnique({
            where: { id: id },
        })

        if (!existingLink) {
            return NextResponse.json({ error: t("link_not_found") }, { status: 404 })
        }

        const authResult = await authenticateAndAuthorize(existingLink.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const link = await prisma.link.update({
            where: { id: id },
            data: {
                title: validated.title.trim(),
                url: validated.url,
                icon_slug: validated.iconSlug || "link"
            },
            include: {
                _count: {
                    select: { views: true },
                },
            },
        })

        return NextResponse.json({ data: link })
    } catch {
        return NextResponse.json({ error: t("failed_to_update") }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("links_apis.errors")

    try {
        const { id } = await params

        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return NextResponse.json({ error: t("not_authenticated") }, { status: 401 })
        }

        // Fetch the link with restaurant to verify ownership
        const existingLink = await prisma.link.findUnique({
            where: { id: id },
            include: { restaurant: true },
        })

        if (!existingLink || existingLink.restaurant.user_id !== data.user.id) {
            return NextResponse.json({ error: t("unauthorized") }, { status: 403 })
        }

        await prisma.linkView.deleteMany({ where: { link_id: id } })
        await prisma.link.delete({ where: { id: id } })
        return NextResponse.json({ data: { success: true } })
    } catch {
        return NextResponse.json({ error: t("failed_to_delete") }, { status: 500 })
    }
}
