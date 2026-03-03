import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({
    code: z.string().trim().regex(/^\d{4}$/),
});

export async function POST(req: Request) {
    const t = await getTranslations("notification_verification_api");
    try {
        const body = await req.json();
        const { code } =
            verifySchema.parse(body);

        const session = await checkAuth();
        if (!session?.user) {
            return NextResponse.json({ ok: false, message: t("error_unauthorized") }, { status: 401 });
        }

        const record = await prisma.notificationVerificationCode.findUnique({
            where: { userId: session.user.id },
        });

        if (!record) {
            return NextResponse.json(
                { ok: false, message: t("error_no_request") },
                { status: 404 }
            );
        }

        if (record.expiresAt < new Date()) {
            await prisma.notificationVerificationCode.delete({
                where: { userId: session.user.id },
            });
            return NextResponse.json(
                { ok: false, message: t("error_code_expired") },
                { status: 400 }
            );
        }

        if (record.code !== code) {
            return NextResponse.json({ ok: false, message: t("error_invalid_code") }, { status: 400 });
        }


        await prisma.notificationVerificationCode.delete({
            where: { userId: session.user.id },
        });

        return NextResponse.json({ ok: true, message: t("success_verified") });

    } catch (err: any) {
        return NextResponse.json(
            { ok: false, message: err?.message ?? t("error_generic") },
            { status: 400 }
        );
    }
}