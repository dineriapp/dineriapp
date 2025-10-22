import { type NextRequest, NextResponse } from "next/server"
import type { AreaResponse, AreasListResponse } from "@/lib/types"
import prisma from "@/lib/prisma"

// GET /api/areas?restaurantId=xxx
export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurantId")

        if (!restaurantId) {
            return NextResponse.json<AreasListResponse>(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            )
        }

        const areas = await prisma.area.findMany({
            where: { restaurant_id: restaurantId },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json<AreasListResponse>({
            success: true,
            data: areas,
        })
    } catch (error) {
        console.error("[Areas GET]", error)
        return NextResponse.json<AreasListResponse>({ success: false, error: "Failed to fetch areas" }, { status: 500 })
    }
}

// POST /api/areas
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, active = true, restaurant_id } = body

        if (!name || !restaurant_id) {
            return NextResponse.json<AreaResponse>(
                { success: false, error: "name and restaurant_id are required" },
                { status: 400 },
            )
        }

        const area = await prisma.area.create({
            data: {
                name,
                active,
                restaurant_id,
            },
        })

        return NextResponse.json<AreaResponse>({ success: true, data: area }, { status: 201 })
    } catch (error) {
        console.error("[Areas POST]", error)
        return NextResponse.json<AreaResponse>({ success: false, error: "Failed to create area" }, { status: 500 })
    }
}
