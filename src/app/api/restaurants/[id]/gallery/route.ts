import { authenticateAndAuthorize } from "@/lib/auth-utils";
import { GalleryItemSchema } from "@/lib/gallery-item.schema";
import prisma from "@/lib/prisma";
import { uploadedFileSchema } from "@/lib/uplaod-file.schema";
import { getYoutubeId } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json({ success: false, error: "Restaurant ID required" }, { status: 400 });
        }

        const restaurant = await prisma.restaurant.findFirst({
            where: { id: id },
        });

        if (!restaurant) {
            return NextResponse.json({ success: false, error: "Restaurant not found or access denied" }, { status: 403 });
        }

        const items = await prisma.galleryItem.findMany({
            where: { restaurant_id: id },
            orderBy: { sort_order: "asc" },
        });

        const safeItems = items.map((item) => {
            if (item.type === "IMAGE") {
                const parsed = uploadedFileSchema.safeParse(item.file);
                return {
                    ...item,
                    file: parsed.success ? parsed.data : null,
                };
            }
            return item;
        });

        return NextResponse.json({ success: true, data: safeItems });
    } catch (error) {
        console.error("Error fetching gallery items:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const auth = await authenticateAndAuthorize(id)
        if (auth.error) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const body = await req.json();

        const parsed = GalleryItemSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
        }

        const { title, file, link, type } = parsed.data;

        if (body?.id) {

            const existing = await prisma.galleryItem.findFirst({
                where: {
                    id: body.id,
                    restaurant_id: id,
                },
            });

            if (!existing) {
                return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
            }
            if (type === "IMAGE") {
                const updatedItem = await prisma.galleryItem.update({
                    where: { id: body.id },
                    data: {
                        title,
                        type,
                        file: file[0],
                        link: link || null,
                        thumbnail: null,
                        youtubeUrl: null,
                        youtubeEmbedUrl: null,
                    },
                });
                return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
            } else if (type === "VIDEO") {
                const youtubeId = getYoutubeId(parsed.data.youtubeUrl);
                if (!youtubeId) {
                    return NextResponse.json(
                        { success: false, error: "Invalid YouTube URL" },
                        { status: 400 }
                    );
                }
                const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}`

                const updatedItem = await prisma.galleryItem.update({
                    where: { id: body.id },
                    data: {
                        title,
                        type,
                        thumbnail: thumbnail,
                        youtubeEmbedUrl: youtubeEmbedUrl,
                        youtubeUrl: parsed.data.youtubeUrl,
                        link: link || null,
                        file: undefined,
                    },
                });
                return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
            }
        }

        if (type === "IMAGE") {
            const newItem = await prisma.galleryItem.create({
                data: {
                    restaurant_id: id,
                    title,
                    type,
                    file: file[0],
                    link: link || null,
                },
            });

            return NextResponse.json({ success: true, data: newItem }, { status: 201 });
        } else if (type === "VIDEO") {
            const youtubeId = getYoutubeId(parsed.data.youtubeUrl);
            if (!youtubeId) {
                return NextResponse.json(
                    { success: false, error: "Invalid YouTube URL" },
                    { status: 400 }
                );
            }
            const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}`

            const newItem = await prisma.galleryItem.create({
                data: {
                    restaurant_id: id,
                    title,
                    type,
                    thumbnail: thumbnail,
                    youtubeEmbedUrl: youtubeEmbedUrl,
                    youtubeUrl: parsed.data.youtubeUrl,
                    link: link || null,
                },
            });

            return NextResponse.json({ success: true, data: newItem }, { status: 201 });
        }


    } catch (error) {
        console.error("Error creating gallery item:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}