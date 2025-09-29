import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
    const { id } = await params;
    const restaurantId = id

    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
    const t = await getTranslations({ locale, namespace: 'api-activity' });
    try {
        const [restaurantViews, linkViews, reviews] = await Promise.all([
            prisma.restaurantView.findMany({
                where: { restaurant_id: restaurantId },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.linkView.findMany({
                where: {
                    link: { restaurant_id: restaurantId },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
                include: { link: true },
            }),
            prisma.review.findMany({
                where: { restaurant_id: restaurantId },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
        ]);

        const activity = [
            ...restaurantViews.map(v => ({
                type: "restaurant_view",
                createdAt: v.createdAt,
                message: t("restaurantView"),
            })),
            ...linkViews.map(v => ({
                type: "link_click",
                createdAt: v.createdAt,
                message: `${t("linkClick", { title: v.link.title })}`,
            })),
            ...reviews.map(r => ({
                type: "review",
                createdAt: r.createdAt,
                message: `${t("newReview", { author: r.author_name, rating: r.rating })}`,
            })),
        ];

        const sorted = activity
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .slice(0, 10);

        return NextResponse.json({ activity: sorted });
    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json({ activity: [], error: t("error") }, { status: 500 });
    }
}
