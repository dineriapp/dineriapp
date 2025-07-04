import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createHash } from "crypto"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // Get QR code
        const qrCode = await prisma.qr_codes.findUnique({
            where: {
                id: id,
                is_active: true,
            },
            select: {
                id: true,
                target_url: true,
                scan_count: true,
            },
        })

        if (!qrCode) {
            return NextResponse.redirect(new URL("/404", request.url))
        }

        // Get client information for analytics
        const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
        const userAgent = request.headers.get("user-agent") || ""
        const referer = request.headers.get("referer") || ""

        // Hash IP for privacy
        const ipHash = createHash("sha256").update(clientIP).digest("hex")

        try {
            // Record the scan
            await prisma.qr_code_scans.create({
                data: {
                    qr_code_id: id,
                    ip_hash: ipHash,
                    user_agent: userAgent,
                    referer: referer,
                },
            })

            // Update scan count and last scanned timestamp
            await prisma.qr_codes.update({
                where: { id: id },
                data: {
                    scan_count: {
                        increment: 1,
                    },
                    last_scanned_at: new Date(),
                },
            })
        } catch (analyticsError) {
            // Don't fail the redirect if analytics fail
            console.error("Error recording QR code scan:", analyticsError)
        }

        // Redirect to target URL
        return NextResponse.redirect(qrCode.target_url)
    } catch (error) {
        console.error("Error in QR code scan:", error)
        return NextResponse.redirect(new URL("/404", request.url))
    }
}
