import { type NextRequest, NextResponse } from "next/server"
import type { TableResponse, TablesListResponse } from "@/lib/types"
import prisma from "@/lib/prisma"

// GET /api/tables?restaurantId=xxx
export async function GET(request: NextRequest) {
    try {
        const restaurantId = request.nextUrl.searchParams.get("restaurantId")

        if (!restaurantId) {
            return NextResponse.json<TablesListResponse>(
                { success: false, error: "restaurantId is required" },
                { status: 400 },
            )
        }

        const tables = await prisma.table.findMany({
            where: { restaurant_id: restaurantId },
            include: { area: true },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json<TablesListResponse>({
            success: true,
            data: tables,
        })
    } catch (error) {
        console.error("[Tables GET]", error)
        return NextResponse.json<TablesListResponse>({ success: false, error: "Failed to fetch tables" }, { status: 500 })
    }
}

// POST /api/tables
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { tableNumber, capacity, areaId, status = "ACTIVE", restaurant_id } = body

        if (!tableNumber || !capacity || !areaId || !restaurant_id) {
            return NextResponse.json<TableResponse>(
                { success: false, error: "tableNumber, capacity, areaId, and restaurant_id are required" },
                { status: 400 },
            )
        }

        const table = await prisma.table.create({
            data: {
                tableNumber,
                capacity,
                areaId,
                status,
                restaurant_id,
            },
            include: { area: true },
        })

        return NextResponse.json<TableResponse>({ success: true, data: table }, { status: 201 })
    } catch (error) {
        console.error("[Tables POST]", error)
        return NextResponse.json<TableResponse>({ success: false, error: "Failed to create table" }, { status: 500 })
    }
}
