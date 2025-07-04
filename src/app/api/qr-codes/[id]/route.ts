import { type NextRequest, NextResponse } from "next/server"
import { updateQRCodeSchema } from "@/lib/qr-validations"
import { QRCodeGenerator } from "@/lib/qr-generator"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { createClient } from "@/supabase/clients/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const qrCode = await prisma.qr_codes.findUnique({
            where: { id: id },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo_url: true,
                        user_id: true,
                    },
                },
                link: {
                    select: {
                        id: true,
                        title: true,
                        url: true,
                    },
                },
            },
        })

        if (!qrCode) {
            return NextResponse.json({ error: "QR code not found" }, { status: 404 })
        }

        // Verify user owns the restaurant
        if (qrCode.restaurant.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        return NextResponse.json(qrCode)
    } catch (error) {
        console.error("Error in QR code GET:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify user owns the QR code
        const qrCode = await prisma.qr_codes.findUnique({
            where: { id: id },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo_url: true,
                        user_id: true,
                    },
                },
            },
        })

        if (!qrCode) {
            return NextResponse.json({ error: "QR code not found" }, { status: 404 })
        }

        // Verify user owns the restaurant
        if (qrCode.restaurant.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await request.json()
        const validatedData = updateQRCodeSchema.parse(body)

        // If visual properties changed, regenerate the QR code image
        const visualPropsChanged =
            validatedData.size !== undefined ||
            validatedData.color !== undefined ||
            validatedData.include_logo !== undefined ||
            validatedData.include_frame !== undefined ||
            validatedData.frame_text !== undefined

        let qrDataUrl = qrCode.qr_data_url
        if (visualPropsChanged) {
            try {
                const scanUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/qr-codes/scan/${id}`
                qrDataUrl = await QRCodeGenerator.generateBrandedQR(scanUrl, {
                    size: validatedData.size || qrCode.size,
                    accentColor: validatedData.color || qrCode.color,
                    logoUrl: (validatedData.include_logo ?? qrCode.include_logo) ? qrCode.restaurant.logo_url ?? undefined : undefined,
                    includeFrame: validatedData.include_frame ?? qrCode.include_frame,
                    frameText:
                        (validatedData.include_frame ?? qrCode.include_frame ?? undefined)
                            ? validatedData.frame_text || qrCode.frame_text ? qrCode.frame_text ?? undefined : undefined
                            : undefined,
                    restaurantName: qrCode.restaurant.name,
                })
            } catch (error) {
                console.error("Error regenerating QR code image:", error)
            }
        }

        const updatedQRCode = await prisma.qr_codes.update({
            where: { id: id },
            data: {
                ...validatedData,
                qr_data_url: qrDataUrl,
                updated_at: new Date(),
            },
            include: {
                link: {
                    select: {
                        id: true,
                        title: true,
                        url: true,
                    },
                },
            },
        })

        return NextResponse.json(updatedQRCode)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
        }

        console.error("Error in QR code PUT:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify user owns the QR code
        const qrCode = await prisma.qr_codes.findUnique({
            where: { id: id },
            include: {
                restaurant: {
                    select: {
                        user_id: true,
                    },
                },
            },
        })

        if (!qrCode) {
            return NextResponse.json({ error: "QR code not found" }, { status: 404 })
        }

        // Verify user owns the restaurant
        if (qrCode.restaurant.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await prisma.qr_codes.delete({
            where: { id: id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in QR code DELETE:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
