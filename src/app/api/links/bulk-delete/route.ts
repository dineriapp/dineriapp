import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
    try {

        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }


        const { linkIds } = await request.json()

        if (!Array.isArray(linkIds) || linkIds.length === 0) {
            return NextResponse.json({ error: "Invalid or empty linkIds" }, { status: 400 })
        }

        // Fetch links and check ownership
        const links = await prisma.link.findMany({
            where: { id: { in: linkIds } },
            include: { restaurant: true },
        })

        const unauthorized = links.some(link => link.restaurant.user_id !== data.user.id)


        if (unauthorized) {
            return NextResponse.json({ error: "Unauthorized: One or more links do not belong to you" }, { status: 403 })
        }

        await prisma.linkView.deleteMany({
            where: { link_id: { in: linkIds } },
        })

        const result = await prisma.link.deleteMany({
            where: { id: { in: linkIds } },
        })

        return NextResponse.json({ data: { deletedCount: result.count } })
    } catch {
        return NextResponse.json({ error: "Failed to delete links" }, { status: 500 })
    }
}
