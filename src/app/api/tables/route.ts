import prisma from "@/lib/prisma"
import type { TablesListResponse } from "@/lib/types"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

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
            // orderBy: { createdAt: "desc" },
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

export async function POST(request: NextRequest) {
    const locale =
        request.cookies.get("NEXT_LOCALE")?.value || "en"

    const t = await getTranslations({
        locale,
        namespace: "tableApi",
    })
    try {
        const body = await request.json()
        const { tableNumber, capacity, areaId, status = "ACTIVE", restaurant_id } = body

        if (!tableNumber || !capacity || !areaId || !restaurant_id) {
            return NextResponse.json(
                { success: false, error: t("errors.required_fields") },
                { status: 400 },
            )
        }

        if (capacity < 1) {
            return NextResponse.json(
                { success: false, error: t("errors.capacity_min") },
                { status: 400 },
            )
        }

        const table = await prisma.table.create({
            data: {
                table_number: tableNumber,
                capacity,
                area_id: areaId,
                status,
                restaurant_id,
            },
            include: { area: true },
        })

        return NextResponse.json({ success: true, data: table }, { status: 201 })

    } catch (error: any) {
        console.error("[Tables POST]", error)

        // Handle unique constraint nicely
        if (error.code === "P2002") {
            return NextResponse.json(
                { success: false, error: t("errors.table_exists") },
                { status: 400 },
            )
        }

        return NextResponse.json(
            { success: false, error: t("errors.create_failed") },
            { status: 500 },
        )
    }
}