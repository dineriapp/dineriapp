import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { sendEmailWithSendGridUsingKey } from "@/lib/send-grid";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const startSchema = z.object({
    email_from_name: z.string().trim().min(2).max(60),
    email_reply_to: z.string().trim().email(),
    email_test_to: z.string().trim().email(),
    sendgrid_api_key: z.string().trim()
});

function generate4DigitCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: Request) {
    const t = await getTranslations("startNotificationIntegration")
    try {
        const body = await req.json();
        const data = startSchema.parse(body);
        console.log(data)

        const session = await checkAuth()
        if (!session?.user) {
            return NextResponse.json({ ok: false, message: t("errors.unauthorized") }, { status: 401 })
        }

        const code = generate4DigitCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store/replace code for this user
        await prisma.notificationVerificationCode.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id, code, expiresAt },
            update: { code, expiresAt },
        });

        try {
            await sendEmailWithSendGridUsingKey({
                apiKey: data.sendgrid_api_key,
                to: data.email_test_to,
                fromEmail: data.email_reply_to,
                fromName: data.email_from_name,
                replyTo: data.email_reply_to,
                subject: "Your verification code",
                html: `<p>Your verification code is <b>${code}</b>. It expires in 10 minutes.</p>`,
                text: `Your verification code is ${code}. It expires in 10 minutes.`,
            });
        } catch (e: any) {
            return NextResponse.json(
                { ok: false, message: e?.message || t("errors.sendFailed") },
                { status: 400 }
            );
        }
        return NextResponse.json({
            ok: true,
            message: t("success.created"),
        });
    } catch (err: any) {
        console.log(err)
        return NextResponse.json(
            { ok: false, message: err?.message ?? t("errors.generic") },
            { status: 400 }
        );
    }
}
