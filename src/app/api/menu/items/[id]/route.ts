import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { getUpdateItemSchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("menu_apis.items.errors")

    try {
        const body = await request.json()
        const { id } = await params
        const itemId = id
        const updateItemSchema = await getUpdateItemSchema()
        const validated = updateItemSchema.parse(body)

        // First get the item to check ownership
        const existingItem = await prisma.menuItem.findUnique({
            where: { id: itemId },
            include: {
                category: true,
            },
        })

        if (!existingItem) {
            return NextResponse.json({ error: t("menu_item_not_found") }, { status: 404 })
        }

        // Authenticate and authorize user
        const authResult = await authenticateAndAuthorize(existingItem.category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const item = await prisma.menuItem.update({
            where: { id: itemId },
            data: {
                name: validated.name.trim(),
                description: validated.description?.trim(),
                price: validated.price,
                allergens: validated.allergens || [],
                is_halal: validated.is_halal,
                allergen_info: validated.allergen_info?.trim(),
                addons: validated.addons ?? [],
                show_in_quick_menu: validated.show_in_quick_menu,
                image: validated.image?.trim() || null,
            },
        })

        return NextResponse.json({ data: item })
    } catch (error) {
        console.error("Error updating item:", error)
        return NextResponse.json({ error: t("failed_to_update") }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("menu_apis.items.errors")

    try {

        const { id } = await params
        const itemId = id

        // First get the item to check ownership
        const existingItem = await prisma.menuItem.findUnique({
            where: { id: itemId },
            include: {
                category: true,
            },
        })

        if (!existingItem) {
            return NextResponse.json({ error: t("menu_item_not_found") }, { status: 404 })
        }

        // Authenticate and authorize user
        const authResult = await authenticateAndAuthorize(existingItem.category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        // Delete the menu item
        await prisma.menuItem.delete({
            where: { id: itemId },
        })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error("Error deleting item:", error)
        return NextResponse.json({ error: t("internal_server_error") }, { status: 500 })
    }
}
