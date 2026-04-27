import { authenticateAndAuthorize } from "@/lib/auth-utils";
import { ApiResponse } from "@/lib/gallery-queries";
import prisma from "@/lib/prisma";
import { StoryLineSchema, StoryLineSchemaValues } from "@/lib/story-line.schema";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const auth = await authenticateAndAuthorize(id);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        const storyLine = await prisma.storyLine.findUnique({
            where: {
                restaurant_id: id,
            },
        });

        return NextResponse.json<ApiResponse<typeof storyLine>>({
            success: true,
            data: storyLine,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error:
                process.env.NODE_ENV === "development" && err instanceof Error
                    ? err.message
                    : "Failed to fetch story line",
        });
    }
}

export async function POST(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const auth = await authenticateAndAuthorize(id)
        if (auth.error) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const body: StoryLineSchemaValues & { id?: string } = await req.json();

        const parsed = StoryLineSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: "Validation failed",
            });
        }

        const data = parsed.data;

        const result = await prisma.storyLine.upsert({
            where: {
                restaurant_id: id
            },
            update: {
                title: data.title,
                description: data.description,
                show: data.show,
                file: data.file[0] ?? null,
            },
            create: {
                restaurant_id: id,
                title: data.title,
                show: data.show,
                description: data.description,
                file: data.file[0] ?? null,
            },
        });

        return NextResponse.json<ApiResponse<typeof result>>({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error:
                process.env.NODE_ENV === "development" && err instanceof Error
                    ? err.message
                    : "Failed to save story line",
        });
    }
}