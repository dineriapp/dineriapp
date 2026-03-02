import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authenticateAndAuthorize, checkSubscriptionLimitsWithPlans } from "@/lib/auth-utils"
import { getCreateItemSchema } from "@/lib/validations"
import { getTranslations } from "next-intl/server"



export async function POST(request: NextRequest) {
    const t = await getTranslations("menu_apis.items.errors")
    try {
        const body = await request.json()
        const createItemSchema = await getCreateItemSchema()
        const validated = createItemSchema.parse(body)
        // First get the category to check ownership
        const category = await prisma.menuCategory.findUnique({
            where: { id: validated.category_id },
        })

        if (!category) {
            return NextResponse.json({ error: t("menu_category_not_found") }, { status: 404 })
        }

        // Authenticate user and verify restaurant ownership
        const authResult = await authenticateAndAuthorize(category.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user, restaurant } = authResult.data!

        // Check subscription limits before creating link
        const limitResult = await checkSubscriptionLimitsWithPlans(user.id, restaurant.id, "menu_items", category.id)
        if (limitResult.error) {
            return NextResponse.json({ error: limitResult.error }, { status: limitResult.status || 500 })
        }

        // Get the next sort order
        const lastItem = await prisma.menuItem.findFirst({
            where: { category_id: validated.category_id },
            orderBy: { sort_order: "desc" },
        })

        const nextSortOrder = lastItem ? lastItem.sort_order + 1 : 0

        const item = await prisma.menuItem.create({
            data: {
                ...validated,
                name: validated.name.trim(),
                description: validated.description?.trim(),
                allergen_info: validated.allergen_info?.trim(),
                sort_order: nextSortOrder,
                show_in_quick_menu: validated.show_in_quick_menu,
                addons: validated.addons ?? [],
                image: validated.image?.trim() || null,
            },
        })

        return NextResponse.json({ data: item }, { status: 201 })
    } catch (error) {
        console.error("Error creating menu item:", error)
        return NextResponse.json({ error: t("internal_server_error") }, { status: 500 })
    }
}
