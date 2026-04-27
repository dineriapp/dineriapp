type BaseEmailProps = {
    to: string | string[];
    subject: string;
    html: string;
    delay?: number
};

type PlatformEmailProps = BaseEmailProps & {
    type: "platform";
};

type RestaurantEmailProps = BaseEmailProps & {
    type: "restaurant";
    apiKey: string;
    fromEmail: string;
    fromName?: string;
};

type SendEmailProps = PlatformEmailProps | RestaurantEmailProps;

type SendEmailResult =
    | { success: true; error: null }
    | { success: false; error: string };

export async function publishEmailToQueue(
    props: SendEmailProps
): Promise<SendEmailResult> {
    try {
        const response = await fetch(
            `${process.env.EMAIL_SERVICE_URL}/send-email`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.EMAIL_SERVICE_KEY!,
                },
                body: JSON.stringify(props),
            }
        );
        const result = await response.json();

        console.log(result)
        if (!response.ok || !result.success) {
            return {
                success: false,
                error: result?.error || "Failed to publish email to queue.",
            };
        }

        return { success: true, error: null };
    } catch (err: unknown) {
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "Unexpected error publishing email.",
        };
    }
}