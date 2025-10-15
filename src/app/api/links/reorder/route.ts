import prisma from "@/lib/prisma"
import { getReorderLinkSchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
    const t = await getTranslations("links_apis.errors")

    try {
        const body = await request.json()
        const reorderLinkSchema = await getReorderLinkSchema()
        const { linkId, direction } = reorderLinkSchema.parse(body)

        const currentLink = await prisma.link.findUnique({ where: { id: linkId } })
        if (!currentLink) {
            return NextResponse.json({ error: t("link_not_found") }, { status: 404 })
        }

        const allLinks = await prisma.link.findMany({
            where: { restaurant_id: currentLink.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        const currentIndex = allLinks.findIndex((link: any) => link.id === linkId)
        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0 || newIndex >= allLinks.length) {
            return NextResponse.json({ error: t("cannot_move_link_direction", { direction: direction }) }, { status: 400 })
        }

        const targetLink = allLinks[newIndex]

        await prisma.$transaction([
            prisma.link.update({
                where: { id: currentLink.id },
                data: { sort_order: targetLink.sort_order },
            }),
            prisma.link.update({
                where: { id: targetLink.id },
                data: { sort_order: currentLink.sort_order },
            }),
        ])

        const updatedLinks = await prisma.link.findMany({
            where: { restaurant_id: currentLink.restaurant_id },
            orderBy: { sort_order: "asc" },
            include: {
                _count: {
                    select: { views: true },
                },
            },
        })

        return NextResponse.json({ data: updatedLinks })
    } catch {
        return NextResponse.json({ error: t("failed_to_reorder") }, { status: 500 })
    }
}
