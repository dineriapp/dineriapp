import { authenticateAndAuthorize, checkSubscriptionLimitsWithPlans } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { createLinkSchema, formatUrl } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {

        const restaurantId = request.nextUrl.searchParams.get("restaurant_id")
        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 })
        }

        const links = await prisma.link.findMany({
            where: { restaurant_id: restaurantId },
            orderBy: { sort_order: "asc" },
            include: {
                _count: {
                    select: { views: true },
                },
            },
        })


        return NextResponse.json({ data: links })
    } catch {
        return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validated = createLinkSchema.parse({
            ...body,
            url: formatUrl(body.url),
        })
        console.log(validated)
        const authResult = await authenticateAndAuthorize(validated.restaurant_id)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const { user, restaurant } = authResult.data!

        // Check subscription limits before creating link
        const limitResult = await checkSubscriptionLimitsWithPlans(user.id, restaurant.id, "links")
        if (limitResult.error) {
            return NextResponse.json({ error: limitResult.error }, { status: limitResult.status || 500 })
        }

        const lastLink = await prisma.link.findFirst({
            where: { restaurant_id: validated.restaurant_id },
            orderBy: { sort_order: "desc" },
        })

        const link = await prisma.link.create({
            data: {
                // ...validated,
                url: validated.url,
                icon_slug: validated.iconSlug,
                restaurant_id: validated.restaurant_id,
                title: validated.title.trim(),
                sort_order: lastLink ? lastLink.sort_order + 1 : 0,
            },
            include: {
                _count: {
                    select: { views: true },
                },
            },
        })

        return NextResponse.json({ data: link })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 })
    }
}
