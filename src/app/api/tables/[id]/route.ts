import { type NextRequest, NextResponse } from "next/server"
import type { TableResponse } from "@/lib/types"
import prisma from "@/lib/prisma"

// PUT /api/tables/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { tableNumber, capacity, areaId, status } = body

        const table = await prisma.table.update({
            where: { id },
            data: {
                ...(tableNumber !== undefined && { tableNumber }),
                ...(capacity !== undefined && { capacity }),
                ...(areaId !== undefined && { areaId }),
                ...(status !== undefined && { status }),
            },
            include: { area: true },
        })

        return NextResponse.json<TableResponse>({
            success: true,
            data: table,
        })
    } catch (error) {
        console.error("[Tables PUT]", error)
        return NextResponse.json<TableResponse>({ success: false, error: "Failed to update table" }, { status: 500 })
    }
}

// DELETE /api/tables/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        await prisma.table.delete({
            where: { id },
        })

        return NextResponse.json<TableResponse>({
            success: true,
        })
    } catch (error) {
        console.error("[Tables DELETE]", error)
        return NextResponse.json<TableResponse>({ success: false, error: "Failed to delete table" }, { status: 500 })
    }
}
