import { type NextRequest, NextResponse } from "next/server"
import { createQRCodeSchema } from "@/lib/qr-validations"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { createClient } from "@/supabase/clients/server"
import { ServerQRCodeGenerator } from "@/lib/server-qr"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()


        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurant_id")

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
        }

        // Verify user owns the restaurant
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { user_id: true },
        })

        if (!restaurant || restaurant.user_id !== user.id) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // Fetch QR codes with related link data
        const qrCodes = await prisma.qr_codes.findMany({
            where: {
                restaurant_id: restaurantId,
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
            orderBy: {
                created_at: "desc",
            },
        })

        return NextResponse.json(qrCodes)
    } catch (error) {
        console.error("Error in QR codes GET:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurant_id")

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
        }

        // Verify user owns the restaurant and get restaurant data
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
                user_id: true,
                name: true,
                slug: true,
                logo_url: true,
            },
        })

        if (!restaurant || restaurant.user_id !== user.id) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        const body = await request.json()
        console.log(body)
        const validatedData = createQRCodeSchema.parse(body)

        // Determine target URL based on type
        let targetUrl = ""
        let linkId = null

        switch (validatedData.type) {
            case "restaurant_page":
                targetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${restaurant.slug}`
                break
            case "link":
                if (!validatedData.link_id) {
                    return NextResponse.json({ error: "Link ID is required for link type" }, { status: 400 })
                }

                // Verify link belongs to restaurant
                const link = await prisma.link.findUnique({
                    where: { id: validatedData.link_id },
                    select: { url: true, restaurant_id: true },
                })

                if (!link || link.restaurant_id !== restaurantId) {
                    return NextResponse.json({ error: "Link not found" }, { status: 404 })
                }

                targetUrl = link.url
                linkId = validatedData.link_id
                break
            case "custom":
                if (!validatedData.custom_url) {
                    return NextResponse.json({ error: "Custom URL is required for custom type" }, { status: 400 })
                }
                targetUrl = validatedData.custom_url
                break
        }

        // Create QR code record first
        const qrCode = await prisma.qr_codes.create({
            data: {
                restaurant_id: restaurantId,
                name: validatedData.name,
                type: validatedData.type,
                target_url: targetUrl,
                link_id: linkId,
                custom_url: validatedData.custom_url,
                size: validatedData.size,
                color: validatedData.color,
                include_logo: validatedData.include_logo,
                include_frame: validatedData.include_frame,
                frame_text: validatedData.frame_text,
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

        // Generate QR code image with scan URL
        const scanUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/qr-codes/scan/${qrCode.id}`

        try {
            const qrDataUrl = await ServerQRCodeGenerator.generateBrandedQR(scanUrl, {
                size: validatedData.size,
                accentColor: validatedData.color,
                logoUrl: validatedData.include_logo ? restaurant.logo_url ?? undefined : undefined,
                includeFrame: validatedData.include_frame,
                frameText: validatedData.include_frame ? validatedData.frame_text : undefined,
                restaurantName: restaurant.name,
            })

            // Update QR code with generated image
            const updatedQRCode = await prisma.qr_codes.update({
                where: { id: qrCode.id },
                data: { qr_data_url: qrDataUrl },
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
        } catch (qrError) {
            console.error("Error generating QR code image:", qrError)
            // Return QR code without image rather than failing
            return NextResponse.json(qrCode)
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error.errors)
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
        }

        console.error("Error in QR codes POST:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
