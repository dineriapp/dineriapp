import { authenticateAndAuthorize, checkSubscriptionLimitsWithPlans } from "@/lib/auth-utils"
import { getCreateFaqCategorySchema } from "@/lib/faq-validations"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const t = await getTranslations("faq_apis_categories")

    try {
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurant_id")

        if (!restaurantId) {
            return NextResponse.json({ error: t("error_restaurant_id_required") }, { status: 400 })
        }

        const authResult = await authenticateAndAuthorize(restaurantId)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const categories = await prisma.faqCategory.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            include: {
                faqs: {
                    orderBy: {
                        sort_order: "asc",
                    },
                },
            },
            orderBy: {
                sort_order: "asc",
            },
        })

        return NextResponse.json({ data: categories })
    } catch (error) {
        console.error("Error fetching FAQ categories:", error)
        return NextResponse.json({ error: t("error_internal_server_error") }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {

    try {
        const body = await request.json()

        const createFaqCategorySchema = await getCreateFaqCategorySchema()

        const validated = createFaqCategorySchema.parse(body)

        const authResult = await authenticateAndAuthorize(validated.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user, restaurant } = authResult.data!

        // Check subscription limits
        const limitResult = await checkSubscriptionLimitsWithPlans(user.id, restaurant.id, "faq_categories")
        if (limitResult.error) {
            return NextResponse.json({ error: limitResult.error }, { status: limitResult.status || 500 })
        }

        // Get the next sort order
        const lastCategory = await prisma.faqCategory.findFirst({
            where: { restaurant_id: validated.restaurant_id },
            orderBy: { sort_order: "desc" },
        })

        const nextSortOrder = lastCategory ? lastCategory.sort_order + 1 : 0

        const category = await prisma.faqCategory.create({
            data: {
                ...validated,
                sort_order: nextSortOrder,
            },
            include: {
                faqs: true,
            },
        })

        return NextResponse.json({ data: category }, { status: 201 })
    } catch (error) {
        const t = await getTranslations("faq_apis_categories")
        console.error("Error creating FAQ category:", error)
        return NextResponse.json({ error: t("error_internal_server_error") }, { status: 500 })
    }
}
