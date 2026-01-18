
import { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types";
import { checkAuth } from "@/lib/auth/utils";
import { extractSendGridFromSettings, getRenderedReservationEmailTemplates } from "@/lib/email-utils";
import prisma from "@/lib/prisma";
import { sendEmailWithSendGridUsingKey } from "@/lib/send-grid";
import { textToSimpleHtml } from "@/lib/utils";
import { Reservation } from "@prisma/client";
import { after, NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reservationId, status } = body;
        const session = await checkAuth();
        if (!session?.user) {
            return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }

        if (!reservationId || !status) {
            return NextResponse.json(
                { success: false, error: "Missing reservationId or status" },
                { status: 400 }
            );
        }

        const updated = await prisma.reservation.update({
            where: { id: reservationId },
            data: { status },
        });

        if (status === "CANCELLED" || status === "CONFIRMED") {
            const restaurant = await prisma.restaurant.findFirst({
                where: {
                    id: updated.restaurant_id,
                    user_id: session.user.id,
                },
                select: {
                    reservation_settings: true,
                    name: true,
                    phone: true
                },
            });
            if (restaurant) {
                const settings = restaurant.reservation_settings?.settings as SettingsState | undefined;
                const extracted = extractSendGridFromSettings(settings);

                sendEmailsForStatus(status, extracted, settings, restaurant, updated);
            }
        }

        return NextResponse.json({
            success: true,
            data: updated,
        });

    } catch (error) {
        console.error("Update Status Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update status" },
            { status: 500 }
        );
    }
}


type Status = "CANCELLED" | "CONFIRMED";

const sendEmailsForStatus = (
    status: Status,
    extracted: ReturnType<typeof extractSendGridFromSettings>,
    settings: SettingsState | undefined,
    restaurant: { name: string | null; phone: string | null },
    reservation: Reservation
) => {
    if (!extracted.ok) return;

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

    const { apiKey, fromEmail, fromName } = extracted.config;
    const renderedTemplates = getRenderedReservationEmailTemplates(settings, vars);

    after(async () => {
        try {
            const tasks: Promise<any>[] = [];

            // Decide template + flags based on status
            const templateType = status === "CONFIRMED" ? "confirmation" : "cancellation";
            const customerEnabled =
                status === "CONFIRMED"
                    ? extracted.email_confirmation_enabled
                    : extracted.email_cancellation_enabled;

            if (customerEnabled) {
                const t = renderedTemplates.find((x) => x.type === templateType);
                if (t && reservation.customer_email) {
                    const subject = t.rendered_subject || t.type;
                    const text = t.rendered_body || "";
                    const html = textToSimpleHtml(text);

                    tasks.push(
                        sendEmailWithSendGridUsingKey({
                            apiKey,
                            to: reservation.customer_email,
                            fromEmail,
                            fromName,
                            replyTo: fromEmail,
                            subject,
                            html,
                            text,
                        })
                    );
                }
            }

            // Owner notifications
            const shouldNotifyOwner =
                extracted.owner_notifications_enabled &&
                extracted.owner_emails.length > 0 &&
                (status === "CONFIRMED"
                    ? extracted.owner_notify_new_bookings
                    : extracted.owner_notify_cancellations);

            if (shouldNotifyOwner) {
                const ownerSubject =
                    status === "CONFIRMED"
                        ? `New reservation: ${vars.guest_name} (${vars.party_size}) - ${vars.date} ${vars.time}`
                        : `Reservation cancelled: ${vars.guest_name} (${vars.party_size}) - ${vars.date} ${vars.time}`;

                const ownerText =
                    (status === "CONFIRMED"
                        ? `New reservation received.\n\n`
                        : `A reservation was cancelled.\n\n`) +
                    `Restaurant: ${vars.restaurant_name}\n` +
                    `Guest: ${vars.guest_name}\n` +
                    `Party size: ${vars.party_size}\n` +
                    `Date: ${vars.date}\n` +
                    `Time: ${vars.time}\n` +
                    `Contact: ${reservation.customer_email}\n`;

                const ownerHtml = textToSimpleHtml(ownerText);

                for (const ownerEmail of extracted.owner_emails) {
                    tasks.push(
                        sendEmailWithSendGridUsingKey({
                            apiKey,
                            to: ownerEmail,
                            fromEmail,
                            fromName,
                            replyTo: fromEmail,
                            subject: ownerSubject,
                            html: ownerHtml,
                            text: ownerText,
                        })
                    );
                }
            }

            await Promise.allSettled(tasks);
        } catch (e) {
            console.log(e);
        }
    });
};
