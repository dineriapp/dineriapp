import { authenticateAndAuthorize } from "@/lib/auth-utils";
import { encrypt_key } from "@/lib/crypto-encrypt-and-decrypt";
import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const emailIntegrationSchema = z.object({
    email_from_name: z.string().min(2),
    email_from_address: z.string().email(),
    resend_api_key: z.string().min(1),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const parsed = emailIntegrationSchema.safeParse(body);

        if (!parsed.success) {
            const formattedErrors = parsed.error.issues
                .map((issue) => {
                    const field = issue.path.join(".");
                    return `${field}: ${issue.message}`;
                })
                .join(", ");

            return NextResponse.json(
                { error: formattedErrors },
                { status: 400 }
            );
        }

        const { email_from_name, email_from_address, resend_api_key } =
            parsed.data;

        // Auth & ownership check
        const authResult = await authenticateAndAuthorize(id);

        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status || 500 }
            );
        }

        const existingRestaurant = authResult.data!.restaurant;

        const emailChanged =
            email_from_address !== existingRestaurant.email_from_address;

        // If email changed but no new API key → reject
        if (emailChanged && !resend_api_key) {
            return NextResponse.json(
                {
                    error:
                        "Changing sender email requires providing a new API key.",
                },
                { status: 400 }
            );
        }

        const updateData: any = {
            email_from_name,
            email_from_address,
            updatedAt: new Date(),
        };

        // If API key provided → encrypt & update
        if (resend_api_key) {
            updateData.email_api_key_encrypted = encrypt_key(resend_api_key);
        }

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email_from_name: true,
                email_from_address: true,
                email_api_key_encrypted: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedRestaurant,
            message: "Email integration updated successfully",
        });
    } catch (error) {
        console.error("Error updating email settings:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}