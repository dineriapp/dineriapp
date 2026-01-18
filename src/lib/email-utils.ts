import type { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types";
import { isNonEmptyString, renderTemplate } from "@/lib/utils";

type SendGridEmailConfig = {
    apiKey: string;
    fromEmail: string;
    fromName: string;
};

type NotificationFlags = {
    email_confirmation_enabled: boolean;
    email_cancellation_enabled: boolean;
    email_24h_reminder_enabled: boolean;

    owner_notifications_enabled: boolean;
    owner_emails: string[];
    owner_notify_new_bookings: boolean;
    owner_notify_cancellations: boolean;
};

type ExtractOk = {
    ok: true;
    enabled: true;
    testModePassed: true;
    config: SendGridEmailConfig;
} & NotificationFlags;

type ExtractFail = {
    ok: false;
    enabled: boolean;
    testModePassed: boolean;
    message: string;
} & NotificationFlags;

export type ExtractResult = ExtractOk | ExtractFail;

export function extractSendGridFromSettings(
    settings?: SettingsState
): ExtractResult {
    const ns = settings?.notification_settings;

    const enabled = Boolean(ns?.notifications_enabled);
    const testModePassed = Boolean(ns?.test_mode_passed);

    const flags: NotificationFlags = {
        email_confirmation_enabled: ns?.email_confirmation_enabled ?? false,
        email_cancellation_enabled: ns?.email_cancellation_enabled ?? false,
        email_24h_reminder_enabled: ns?.email_24h_reminder_enabled ?? false,

        owner_notifications_enabled: ns?.owner_notifications_enabled ?? false,
        owner_emails: ns?.owner_emails ?? [],
        owner_notify_new_bookings: ns?.owner_notify_new_bookings ?? false,
        owner_notify_cancellations: ns?.owner_notify_cancellations ?? false,
    };

    if (!enabled || !testModePassed) {
        return {
            ok: false,
            enabled,
            testModePassed,
            message: "Email notifications are not enabled or test mode is not passed.",
            ...flags,
        };
    }

    const apiKey = ns?.sendgrid_api_key;
    const fromEmail = ns?.email_reply_to;
    const fromName = ns?.email_from_name;

    if (!isNonEmptyString(apiKey)) {
        return {
            ok: false, enabled, testModePassed,
            message: "Missing sendgrid_api_key",
            ...flags,

        };
    }
    if (!isNonEmptyString(fromEmail)) {
        return {
            ok: false,
            enabled, testModePassed,
            message: "Missing fromEmail",
            ...flags,

        };
    }
    if (!isNonEmptyString(fromName)) {
        return {
            ok: false,
            enabled,
            testModePassed,
            message: "Missing fromName",
            ...flags,

        };
    }
    return {
        ok: true,
        enabled: true,
        testModePassed: true,
        config: { apiKey, fromEmail, fromName },
        ...flags,
    };
}

export type EmailTemplateType = "confirmation" | "reminder" | "cancellation";

export type RenderedEmailTemplate = {
    type: EmailTemplateType;
    subject: string;
    body: string;
    rendered_subject: string;
    rendered_body: string;
};

export type ReservationEmailVars = {
    restaurant_name: string;
    guest_name: string;
    party_size: number;
    date: string;
    time: string;
    restaurant_contact: string;
};

export function getRenderedReservationEmailTemplates(
    settings: SettingsState | undefined,
    vars: ReservationEmailVars
): RenderedEmailTemplate[] {
    const ns = settings?.notification_settings;

    const templates: Array<{ type: EmailTemplateType; subject: string; body: string }> = [
        {
            type: "confirmation",
            subject: ns?.email_confirmation_subject ?? "",
            body: ns?.email_confirmation_body ?? "",
        },
        {
            type: "reminder",
            subject: ns?.email_reminder_subject ?? "",
            body: ns?.email_reminder_body ?? "",
        },
        {
            type: "cancellation",
            subject: ns?.email_cancellation_subject ?? "",
            body: ns?.email_cancellation_body ?? "",
        },
    ];

    return templates.map((t) => ({
        ...t,
        rendered_subject: renderTemplate(t.subject, vars),
        rendered_body: renderTemplate(t.body, vars),
    }));
}