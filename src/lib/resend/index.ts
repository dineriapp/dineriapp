type BaseEmailProps = {
    to: string | string[];
    subject: string;
    html: string;
};

type PlatformEmailProps = BaseEmailProps & {
    type: "platform";
};

type RestaurantEmailProps = BaseEmailProps & {
    type: "restaurant";
    apiKey: string;        // required
    fromEmail: string;     // required
    fromName?: string;
};

type SendEmailProps = PlatformEmailProps | RestaurantEmailProps;

type SendEmailResult =
    | { success: true; error: null }
    | { success: false; error: string };

export async function sendEmailUsingResend(
    props: SendEmailProps
): Promise<SendEmailResult> {
    let finalApiKey: string;
    let finalFromEmail: string;
    let fromName: string = "Dineri";

    if (props.type === "platform") {
        finalApiKey = process.env.RESEND_API_KEY!;
        finalFromEmail = process.env.RESEND_FROM_EMAIL!;
    } else {
        // TypeScript KNOWS this is restaurant type
        finalApiKey = props.apiKey;
        finalFromEmail = props.fromEmail;
        fromName = props.fromName || "Restaurant";
    }

    if (!finalApiKey || !finalFromEmail) {
        return {
            success: false,
            error: "Missing email configuration.",
        };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${finalApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: `${fromName} <${finalFromEmail}>`,
                to: Array.isArray(props.to) ? props.to : [props.to],
                subject: props.subject,
                html: props.html,
            }),
        });

        const result = await response.json();
        console.log("Resend API response:", { status: response.status, body: result });
        if (!response.ok || result?.error || result?.message) {
            return {
                success: false,
                error: result?.error?.message || result?.message || "Failed to send email.",
            };
        }

        return { success: true, error: null };
    } catch (err: unknown) {
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "Unexpected error sending email.",
        };
    }
}