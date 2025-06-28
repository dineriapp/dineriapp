import prisma from "@/lib/prisma"
import { createLinkSchema, formatUrl } from "@/lib/validations"
import { createClient } from "@/supabase/clients/server"
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
        })

        return NextResponse.json({ data: links })
    } catch {
        return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {

        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();

        if (!data.user) {
            return NextResponse.json({ error: "Not authenticated", restaurants: [] }, { status: 401 });
        }

        const prismaUser = await prisma.user.findFirst({
            where: {
                id: data.user.id
            }
        })

        if (!prismaUser) {
            return NextResponse.json({ error: "User not found", restaurants: [] }, { status: 404 });
        }

        const body = await request.json()
        const validated = createLinkSchema.parse({
            ...body,
            url: formatUrl(body.url),
        })

        // ✅ Ownership check
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: validated.restaurant_id },
        });

        if (!restaurant || restaurant.user_id !== data.user.id) {
            return NextResponse.json({ error: "Unauthorized: You do not own this restaurant." }, { status: 403 });
        }

        const linksCount = await prisma.link.count({
            where: {
                restaurant_id: restaurant.id,
            }
        })

        if (prismaUser.subscription_plan === "basic" && linksCount >= 4) {
            return NextResponse.json(
                { error: "You are limited to 4 links on the Basic plan." },
                { status: 403 } // 403 is more appropriate than 401 here
            );
        }

        const lastLink = await prisma.link.findFirst({
            where: { restaurant_id: validated.restaurant_id },
            orderBy: { sort_order: "desc" },
        })

        const link = await prisma.link.create({
            data: {
                ...validated,
                title: validated.title.trim(),
                sort_order: lastLink ? lastLink.sort_order + 1 : 0,
            },
        })

        return NextResponse.json({ data: link })
    } catch {
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 })
    }
}
