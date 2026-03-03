"use server";

import { sendEmailUsingResend } from "../resend";


type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmailAction(params: SendEmailParams) {
  const { to, subject, html } = params;

  const result = await sendEmailUsingResend({
    type: "platform",
    to,
    subject,
    html,
  });

  if (!result.success) {
    console.error("Email error:", result.error);
    return { success: false, error: result.error };
  }

  console.log({ msg: `email sent to: ${to}` });

  return { success: true };
}