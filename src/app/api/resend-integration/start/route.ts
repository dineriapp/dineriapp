import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { sendEmailUsingResend } from "@/lib/resend";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const startSchema = z.object({
    email_from_name: z.string().trim().min(2).max(30),
    email_from_address: z.string().trim().email(),
    email_test_to: z.string().trim().email(),
    resend_api_key: z.string().trim().min(1),
});

function generate4DigitCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: Request) {
    const t = await getTranslations("notifications_api");
    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { ok: false, message: t("error_invalid_body") },
                { status: 400 }
            );
        }

        const parsed = startSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, message: t("error_invalid_body") },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const session = await checkAuth();
        if (!session?.user) {
            return NextResponse.json(
                { ok: false, message: t("error_unauthorized") },
                { status: 401 }
            );
        }

        const code = generate4DigitCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        try {
            await prisma.notificationVerificationCode.upsert({
                where: { userId: session.user.id },
                create: { userId: session.user.id, code, expiresAt },
                update: { code, expiresAt },
            });
        } catch {
            return NextResponse.json(
                { ok: false, message: t("error_save_verification") },
                { status: 500 }
            );
        }

        // Email sending
        const emailResult = await sendEmailUsingResend({
            type: "restaurant",
            apiKey: data.resend_api_key,
            to: data.email_test_to,
            fromEmail: data.email_from_address,
            fromName: data.email_from_name,
            subject: "Your verification code",
            html: `<p>Your verification code is <b>${code}</b>. It expires in 10 minutes.</p>`,
        });
        console.log("Email send result:", code);
        if (!emailResult.success) {
            return NextResponse.json(
                { ok: false, message: emailResult.error || t("error_send_email") },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: t("success_code_sent"),
        });

    } catch {
        return NextResponse.json(
            { ok: false, message: t("error_generic") },
            { status: 500 }
        );
    }
}