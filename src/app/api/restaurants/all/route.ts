import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";

export async function GET() {

    const session = await checkAuth()

    const t = await getTranslations("restaurants_apis.errors")

    if (!session?.user) {
        return NextResponse.json({ error: t("unauthorized"), restaurants: [] }, { status: 401 });
    }

    try {
        const restaurants = await prisma.restaurant.findMany({
            where: {
                user_id: session.user.id,
            },
            include: {
                _count: {
                    select: { restaurantViews: true, links: true, faqCategories: true, menuCategories: true, events: true },
                },
            },
        });

        if (restaurants.length > 0) {
            return NextResponse.json({ restaurants, error: "" }, { status: 200 });
        } else {
            return NextResponse.json({ restaurants: [], error: t("restaurants_not_found") }, { status: 404 });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: t("internal_server_error"), restaurants: [] }, { status: 500 });
    }
}
