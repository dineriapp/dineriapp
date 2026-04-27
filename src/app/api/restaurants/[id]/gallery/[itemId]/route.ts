import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { deleteS3Objects } from "@/lib/server/functions/delete-from-aws";
import { isUploadedFile } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
    try {
        const session = await checkAuth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const { itemId, restaurantId } = await params

        const restaurant = await prisma.restaurant.findFirst({
            where: { id: restaurantId, user_id: session.user.id },
        });
        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found or access denied" }, { status: 403 });
        }

        // Verify item belongs to this restaurant
        const item = await prisma.galleryItem.findFirst({
            where: { id: itemId, restaurant_id: restaurantId },
        });
        if (!item) {
            return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
        }

        const deltedItem = await prisma.galleryItem.delete({
            where: { id: itemId },
        });

        if (isUploadedFile(deltedItem.file)) {
            deleteS3Objects([deltedItem.file.key])
                .then((data) => {
                    console.log("Deleted images:", data.deleted);
                })
                .catch((err) => {
                    console.error("S3 delete error:", err);
                });
        }

        return NextResponse.json({ success: true, data: { id: deltedItem.id } });
    } catch (error) {
        console.error("Error deleting gallery item:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}