import { sendEmailAction } from "@/lib/auth/send-email.action";
import { after, NextResponse } from "next/server";
import * as z from "zod";

const jobApplicationSchema = z.object({
    fullName: z.string().min(2),
    title: z.string(),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(5),
    experience: z.string().min(1),
    education: z.string().min(1),
    coverLetter: z.string().min(50),
    resume: z.string().url(), // 👈 resume link
    portfolio: z.string().url().optional().or(z.literal("")),
    linkedIn: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    salaryExpectations: z.string().min(1),
    noticePeriod: z.string().min(1),
    gender: z.string().min(1),
    ethnicity: z.string().optional(),
    veteranStatus: z.string().optional(),
    disability: z.string().optional(),
});

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxVTubkr5gOSC8ot-_g72WKSp3Ld8UDjNMrk8aYkTcyfAmxgamsF093iznBAj0FMjbm/exec";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parsed = jobApplicationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const encodedBody =
            `FullName=${encodeURIComponent(data.fullName)}` +
            `&Email=${encodeURIComponent(data.email)}` +
            `&Phone=${encodeURIComponent(data.phone)}` +
            `&Address=${encodeURIComponent(data.address)}` +
            `&City=${encodeURIComponent(data.city)}` +
            `&State=${encodeURIComponent(data.state)}` +
            `&ZipCode=${encodeURIComponent(data.zipCode)}` +
            `&Experience=${encodeURIComponent(data.experience)}` +
            `&Education=${encodeURIComponent(data.education)}` +
            `&CoverLetter=${encodeURIComponent(data.coverLetter)}` +
            `&Resume=${encodeURIComponent(data.resume)}` +
            `&Portfolio=${encodeURIComponent(data.portfolio || "")}` +
            `&LinkedIn=${encodeURIComponent(data.linkedIn || "")}` +
            `&Github=${encodeURIComponent(data.github || "")}` +
            `&Salary=${encodeURIComponent(data.salaryExpectations)}` +
            `&NoticePeriod=${encodeURIComponent(data.noticePeriod)}` +
            `&Gender=${encodeURIComponent(data.gender)}` +
            `&Ethnicity=${encodeURIComponent(data.ethnicity || "")}` +
            `&VeteranStatus=${encodeURIComponent(data.veteranStatus || "")}` +
            `&Disability=${encodeURIComponent(data.disability || "")}`;

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
                to: data.email,
                subject: `Application received – ${data.title}`,
                html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hi ${data.fullName},</h2>
            <p>Thank you for applying for the <strong>${data.title}</strong> position.</p>
            <p>We have received your application and our team will review it shortly.</p>
            <p>We will get back to you as soon as possible.</p>
            <br/>
            <p>Best regards,<br/>HR Team</p>
            <hr/>
            <p style="font-size:12px;color:#666;">This is an automated message. Please do not reply.</p>
          </div>
        `,
            });
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("JOB API ERROR:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
