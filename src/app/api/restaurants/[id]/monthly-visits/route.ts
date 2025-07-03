import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const restaurantId = id;

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const count = await prisma.restaurantView.count({
        where: {
            restaurant_id: restaurantId,
            createdAt: {
                gte: start,
                lte: end,
            },
        },
    });

    return Response.json({ count });
}
