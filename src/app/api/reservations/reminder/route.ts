import { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types";
import { checkAuth } from "@/lib/auth/utils";
import {
    extractSendGridFromSettings,
    getRenderedReservationEmailTemplates,
} from "@/lib/email-utils";
import prisma from "@/lib/prisma";
import { sendEmailWithSendGridUsingKey } from "@/lib/send-grid";
import { textToSimpleHtml } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { after, NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const t = await getTranslations("sendReminder")
    try {
        const session = await checkAuth();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: t("errors.unauthorized") },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { reservationId } = body;

        if (!reservationId) {
            return NextResponse.json(
                { success: false, error: t("errors.missingReservationId") },
                { status: 400 }
            );
        }

        const reservation = await prisma.reservation.findFirst({
            where: { id: reservationId, },
        });

        if (!reservation) {
            return NextResponse.json(
                { success: false, error: t("errors.reservationNotFound") },
                { status: 404 }
            );
        }

        if (reservation.reminder_sent) {
            return NextResponse.json(
                { success: false, error: t("errors.reminderAlreadySent") },
                { status: 400 }
            );
        }

        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: reservation.restaurant_id,
                user_id: session.user.id,
            },
            select: {
                reservation_settings: true,
                name: true,
                phone: true,
            },
        });

        if (!restaurant) {
            return NextResponse.json(
                { success: false, error: t("errors.restaurantNotFound") },
                { status: 404 }
            );
        }

        const settings =
            restaurant.reservation_settings?.settings as
            | SettingsState
            | undefined;

        const extracted = extractSendGridFromSettings(settings);

        if (
            !extracted.ok ||
            !extracted.email_24h_reminder_enabled ||
            !reservation.customer_email
        ) {
            return NextResponse.json(
                { success: false, error: t("errors.reminderNotEnabled") },
                { status: 400 }
            );
        }

        const vars = {
            restaurant_name: restaurant.name ?? "",
            guest_name: reservation.customer_name ?? "",
            party_size: reservation.party_size,
            date: reservation.arrival_time.toLocaleDateString("en-GB"),
            time: reservation.arrival_time.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            restaurant_contact: restaurant.phone ?? "",
        };

        const templates = getRenderedReservationEmailTemplates(settings, vars);
        const reminderTemplate = templates.find((t) => t.type === "reminder");

        if (
            !reminderTemplate ||
            !reminderTemplate.rendered_subject ||
            !reminderTemplate.rendered_body
        ) {
            return NextResponse.json(
                { success: false, error: t("errors.templateNotConfigured") },
                { status: 400 }
            );
        }

        after(async () => {
            try {
                await sendEmailWithSendGridUsingKey({
                    apiKey: extracted.config.apiKey,
                    to: reservation.customer_email!,
                    fromEmail: extracted.config.fromEmail,
                    fromName: extracted.config.fromName,
                    replyTo: extracted.config.fromEmail,
                    subject: reminderTemplate.rendered_subject,
                    html: textToSimpleHtml(reminderTemplate.rendered_body),
                    text: reminderTemplate.rendered_body,
                });

                await prisma.reservation.update({
                    where: { id: reservation.id },
                    data: { reminder_sent: true },
                });
            } catch (e) {
                console.error("Reminder email error:", e);
            }
        });

        return NextResponse.json({
            success: true,
            message: t("success.sent"),
            data: {
                id: reservationId
            }
        });
    } catch (error) {
        console.error("Send reminder error:", error);
        return NextResponse.json(
            { success: false, error: t("errors.failedToSend") },
            { status: 500 }
        );
    }
}
