"use server";

import sgMail from "@sendgrid/mail";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmailAction(params: SendEmailParams) {
  const { to, subject, html } = params;

  const apiKey = process.env.SENDGRID_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("SendGrid API key is missing.");
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!, // must be verified in SendGrid
      name: process.env.SENDGRID_FROM_NAME || "My App",
    },
    replyTo: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (err: any) {
    const sgErrors = err?.response?.body?.errors;
    const details =
      Array.isArray(sgErrors) && sgErrors.length
        ? sgErrors.map((e: any) => e.message).join(", ")
        : err?.message;

    console.error("SendGrid error:", details);
    return { success: false, error: details || "Failed to send email" };
  }
}
