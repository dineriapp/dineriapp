import { checkAuth } from "@/lib/auth/utils";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({
    code: z.string().trim().regex(/^\d{4}$/, "Code must be 4 digits"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code } = verifySchema.parse(body);

        const session = await checkAuth()
        if (!session?.user) {
            return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 })
        }


        const record = await prisma.notificationVerificationCode.findUnique({
            where: { userId: session.user.id },
        });

        if (!record) {
            return NextResponse.json(
                { ok: false, message: "No verification request found. Please send code again." },
                { status: 404 }
            );
        }

        if (record.expiresAt < new Date()) {
            // clear expired record
            await prisma.notificationVerificationCode.delete({ where: { userId: session.user.id } });
            return NextResponse.json(
                { ok: false, message: "Code expired. Please send a new code." },
                { status: 400 }
            );
        }

        if (record.code !== code) {
            return NextResponse.json({ ok: false, message: "Invalid code." }, { status: 400 });
        }

        // ✅ Success: clear record after successful verification
        await prisma.notificationVerificationCode.delete({ where: { userId: session.user.id } });

        // Optional: update notification settings to mark passed in DB
        // await prisma.notificationSettings.update({
        //   where: { userId },
        //   data: { test_mode_passed: true },
        // });

        return NextResponse.json({ ok: true, message: "Verified successfully" });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, message: err?.message ?? "Something went wrong" },
            { status: 400 }
        );
    }
}
