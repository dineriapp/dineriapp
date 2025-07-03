import prisma from "@/lib/prisma"
import { updateLinkSchema, formatUrl } from "@/lib/validations"
import { createClient } from "@/supabase/clients/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const validated = updateLinkSchema.parse({
            ...body,
            url: formatUrl(body.url),
        })

        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Fetch the link along with restaurant to check ownership
        const existingLink = await prisma.link.findUnique({
            where: { id: id },
            include: { restaurant: true },

        })

        if (!existingLink || existingLink.restaurant.user_id !== data.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const link = await prisma.link.update({
            where: { id: id },
            data: {
                title: validated.title.trim(),
                url: validated.url,
            },
            include: {
                _count: {
                    select: { views: true },
                },
            },
        })

        return NextResponse.json({ data: link })
    } catch {
        return NextResponse.json({ error: "Failed to update link" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Fetch the link with restaurant to verify ownership
        const existingLink = await prisma.link.findUnique({
            where: { id: id },
            include: { restaurant: true },
        })

        if (!existingLink || existingLink.restaurant.user_id !== data.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }


        await prisma.linkView.deleteMany({ where: { link_id: id } })
        await prisma.link.delete({ where: { id: id } })
        return NextResponse.json({ data: { success: true } })
    } catch {
        return NextResponse.json({ error: "Failed to delete link" }, { status: 500 })
    }
}
