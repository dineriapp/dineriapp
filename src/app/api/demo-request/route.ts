import { sendEmailAction } from "@/lib/auth/send-email.action";
import { after, NextResponse } from "next/server";
import * as z from "zod";

export const demoSchema = z.object({
    businessName: z.string().min(2),
    contactPerson: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
    address: z.string().min(5),
    city: z.string().min(2),
    country: z.string().min(2),
    message: z.string().optional(),
});

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyM0z5JtCy_j9D3NDMGckIwr4fBGXASxChJi7Q0uWiFR_4jQApC5n-gFb7-vqdwC7b07A/exec";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parsed = demoSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const encodedBody =
            `BusinessName=${encodeURIComponent(data.businessName)}` +
            `&ContactPerson=${encodeURIComponent(data.contactPerson)}` +
            `&Email=${encodeURIComponent(data.email)}` +
            `&Phone=${encodeURIComponent(data.phone)}` +
            `&Address=${encodeURIComponent(data.address)}` +
            `&City=${encodeURIComponent(data.city)}` +
            `&Country=${encodeURIComponent(data.country)}` +
            `&Message=${encodeURIComponent(data.message || "")}`;

        // ✅ Save to Google Sheet
        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: encodedBody,
        });

        // ✅ Send thank-you email in background
        after(async () => {
            await sendEmailAction({
                to: data.email,
                subject: "Thanks for requesting a demo",
                html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hi ${data.contactPerson},</h2>
            <p>Thank you for requesting a demo.</p>
            <p>Our team will contact you as soon as possible.</p>
            <br/>
            <p>Best regards,<br/>Sales Team</p>
            <hr/>
            <p style="font-size:12px;color:#666;">This is an automated message. Please do not reply.</p>
          </div>
        `,
            });
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DEMO API ERROR:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
