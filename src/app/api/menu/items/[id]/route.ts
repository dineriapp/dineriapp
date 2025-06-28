import prisma from "@/lib/prisma"
import { updateItemSchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()
        const validated = updateItemSchema.parse(body)

        const item = await prisma.menuItem.update({
            where: { id: params.id },
            data: {
                name: validated.name.trim(),
                description: validated.description?.trim(),
                price: validated.price,
                allergens: validated.allergens || [],
                is_halal: validated.is_halal,
                allergen_info: validated.allergen_info?.trim(),
            },
        })

        return NextResponse.json({ data: item })
    } catch (error) {
        console.error("Error updating item:", error)
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.menuItem.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error("Error deleting item:", error)
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }
}
