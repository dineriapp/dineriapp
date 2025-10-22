import { type NextRequest, NextResponse } from "next/server"
import type { AreaResponse } from "@/lib/types"
import prisma from "@/lib/prisma"

// PUT /api/areas/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, active } = body

        const area = await prisma.area.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(active !== undefined && { active }),
            },
        })

        return NextResponse.json<AreaResponse>({
            success: true,
            data: area,
        })
    } catch (error) {
        console.error("[Areas PUT]", error)
        return NextResponse.json<AreaResponse>({ success: false, error: "Failed to update area" }, { status: 500 })
    }
}

// DELETE /api/areas/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        await prisma.area.delete({
            where: { id },
        })

        return NextResponse.json<AreaResponse>({
            success: true,
        })
    } catch (error) {
        console.error("[Areas DELETE]", error)
        return NextResponse.json<AreaResponse>({ success: false, error: "Failed to delete area" }, { status: 500 })
    }
}
