import { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types";
import { checkAuth } from "@/lib/auth/utils";
import { extractSendGridFromSettings, getRenderedReservationEmailTemplates } from "@/lib/email-utils";
import prisma from "@/lib/prisma";
import { sendEmailWithSendGridUsingKey } from "@/lib/send-grid";
import { textToSimpleHtml } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const startSchema = z.object({
    restaurant_id: z.string(),
    sendTo: z.string().email("Enter a valid email address"),
    restaurant_name: z.string().min(1, "Restaurant name is required"),
    guest_name: z.string().min(1, "Guest name is required"),
    party_size: z.coerce.number().int("Must be a whole number").min(1, "Must be at least 1"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    restaurant_contact: z.string().min(1, "Restaurant contact is required"),
});

export async function POST(req: Request) {
    const t = await getTranslations("testTemplatesApi")
    try {
        const session = await checkAuth();
        if (!session?.user) {
            return NextResponse.json({ ok: false, message: t("errors.unauthorized") }, { status: 401 });
        }

        const body = await req.json();
        const data = startSchema.parse(body);

        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: data.restaurant_id,
                user_id: session.user.id,
            },
            select: {
                reservation_settings: true,
            },
        });

        if (!restaurant) {
            return NextResponse.json(
                { ok: false, message: t("errors.restaurantNotFound") },
                { status: 401 }
            );
        }

        const settings = restaurant?.reservation_settings?.settings as SettingsState | undefined;

        const extracted = extractSendGridFromSettings(settings);
        if (!extracted.ok) {
            return NextResponse.json({ ok: false, message: extracted.message }, { status: 400 });
        }

        const { apiKey, fromEmail, fromName } = extracted.config;

        const vars = {
            restaurant_name: data.restaurant_name,
            guest_name: data.guest_name,
            party_size: data.party_size,
            date: data.date,
            time: data.time,
            restaurant_contact: data.restaurant_contact,
        };

        const renderedTemplates = getRenderedReservationEmailTemplates(settings, vars);

        try {
            for (const t of renderedTemplates) {
                const subject = `[TEST] ${t.rendered_subject || t.type}`;
                const text = t.rendered_body || "";
                const html = textToSimpleHtml(text);

                await sendEmailWithSendGridUsingKey({
                    apiKey: apiKey,
                    to: data.sendTo,
                    fromEmail: fromEmail,
                    fromName,
                    replyTo: fromEmail,
                    subject,
                    html,
                    text,
                });
            }
        } catch (e: any) {
            return NextResponse.json(
                {
                    ok: false,
                    message: e?.message || t("errors.sendFailed"),
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: `${t("success.sent", { sendTo: data.sendTo })}`,
            templates: renderedTemplates,
            data,
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                {
                    ok: false,
                    message: t("errors.validationError"),
                    errors: err.flatten(),
                },
                { status: 400 }
            );
        }

        console.log(err);
        return NextResponse.json(
            { ok: false, message: err?.message ?? `${t("errors.generic")}` },
            { status: 400 }
        );
    }
}
