import prisma from "@/lib/prisma";
import { createClient } from "@/supabase/clients/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        return NextResponse.json({ error: "Not authenticated", restaurants: [] }, { status: 401 });
    }

    try {
        const restaurants = await prisma.restaurant.findMany({
            where: {
                user_id: data.user.id,
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
            return NextResponse.json({ restaurants: [], error: "Restaurants Not Found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error", restaurants: [] }, { status: 500 });
    }
}
