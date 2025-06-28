import prisma from "@/lib/prisma"
import { createItemSchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = createItemSchema.parse(body)

        const lastItem = await prisma.menuItem.findFirst({
            where: { category_id: validated.category_id },
            orderBy: { sort_order: "desc" },
        })

        const item = await prisma.menuItem.create({
            data: {
                ...validated,
                name: validated.name.trim(),
                description: validated.description?.trim(),
                allergen_info: validated.allergen_info?.trim(),
                sort_order: lastItem ? lastItem.sort_order + 1 : 0,
            },
        })

        return NextResponse.json({ data: item })
    } catch (error) {
        console.error("Error creating item:", error)
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
    }
}
