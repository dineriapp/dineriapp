import { sendEmailAction } from "@/lib/auth/send-email.action";
import { after, NextResponse } from "next/server";
import * as z from "zod";

export const supportSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    urgency: z.enum(["low", "medium", "high"]),
    issueType: z.string().min(1),
    subject: z.string().min(5),
    message: z.string().min(10),
    attachments: z.array(z.string().url()).optional(),
    terms: z.literal(true),
});

export type SupportFormData = z.infer<typeof supportSchema>;

// Deployment ID
// AKfycbxdUY_ - 2ASrI7QrIy61V2YvIuzcF - 8Vd - BZ_N59daJMrKmdpPMXKFC - cTxN5T2V11wQTg 
const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxdUY_-2ASrI7QrIy61V2YvIuzcF-8Vd-BZ_N59daJMrKmdpPMXKFC-cTxN5T2V11wQTg/exec";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate with Zod
        const parsed = supportSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const {
            name,
            email,
            urgency,
            issueType,
            subject,
            message,
            attachments,
        } = parsed.data;

        // Convert attachments array to string (for Google Sheet)
        const attachmentsStr = attachments?.join("\n") || "";

        // Encode fields for Google Sheet
        const encodedBody =
            `Name=${encodeURIComponent(name)}` +
            `&Email=${encodeURIComponent(email)}` +
            `&Urgency=${encodeURIComponent(urgency)}` +
            `&IssueType=${encodeURIComponent(issueType)}` +
            `&Subject=${encodeURIComponent(subject)}` +
            `&Message=${encodeURIComponent(message)}` +
            `&Attachments=${encodeURIComponent(attachmentsStr)}`;

        // Send to Google Script
        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: encodedBody,
        });

        // Send thank-you email in background
        after(async () => {
            await sendEmailAction({
                to: email,
                subject: "Thanks for contacting support",
                html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hi ${name},</h2>
            <p>Thank you for contacting our support team.</p>
            <p>We’ve received your request and will get back to you as soon as possible.</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p style="color:#666;font-size:12px;">This is an automated message. Please do not reply.</p>
          </div>
        `,
            });
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("API ERROR:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
