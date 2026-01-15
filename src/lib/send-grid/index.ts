import sgMail from "@sendgrid/mail";

type SendEmailProps = {
    to: string | string[];
    fromEmail: string;      // must be verified sender on SendGrid
    fromName?: string;      // display name
    replyTo?: string;
    subject: string;
    apiKey: string;         // <-- changed name
    html?: string;
    text?: string;
};

export async function sendEmailWithSendGridUsingKey(props: SendEmailProps) {
    const apiKey = props.apiKey?.trim();

    if (!apiKey) {
        throw new Error("SendGrid API key is missing.");
    }

    sgMail.setApiKey(apiKey);

    const msg = {
        to: props.to,
        from: props.fromName
            ? { email: props.fromEmail, name: props.fromName }
            : props.fromEmail,
        replyTo: props.replyTo,
        subject: props.subject,
        text: props.text,
        html: props.html,
    };

    try {
        await sgMail.send(msg as any);
        return { ok: true };
    } catch (err: any) {
        const sgErrors = err?.response?.body?.errors;
        const details =
            Array.isArray(sgErrors) && sgErrors.length
                ? sgErrors.map((e: any) => e.message).join(", ")
                : err?.message;

        throw new Error(details || "Failed to send email via SendGrid.");
    }
}
