import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
    const t = await getTranslations("links_apis.errors")
    try {

        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return NextResponse.json({ error: t("not_authenticated") }, { status: 401 })
        }


        const { linkIds } = await request.json()

        if (!Array.isArray(linkIds) || linkIds.length === 0) {
            return NextResponse.json({ error: t("invalid_or_empty_link_ids") }, { status: 400 })
        }

        // Fetch links and check ownership
        const links = await prisma.link.findMany({
            where: { id: { in: linkIds } },
            include: { restaurant: true },
        })

        const unauthorized = links.some(link => link.restaurant.user_id !== data.user.id)


        if (unauthorized) {
            return NextResponse.json({ error: t("unauthorized_bulk_delete") }, { status: 403 })
        }

        await prisma.linkView.deleteMany({
            where: { link_id: { in: linkIds } },
        })

        const result = await prisma.link.deleteMany({
            where: { id: { in: linkIds } },
        })

        return NextResponse.json({ data: { deletedCount: result.count } })
    } catch {
        return NextResponse.json({ error: t("failed_to_delete_bulk") }, { status: 500 })
    }
}
