"use server";

import transporter from "./nodemailer";


type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmailAction(params: SendEmailParams) {
  const { to, subject, html } = params;

  const mailOptions = {
    from: `${process.env.NODEMAILER_USER}`,
    to,
    subject: `${subject}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}