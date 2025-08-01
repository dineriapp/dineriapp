import { authenticateAndAuthorize } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const restaurantId = id

        const authResult = await authenticateAndAuthorize(restaurantId)
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
        }

        const body = await request.json()

        const {
            menuPageBackgroundImage,
            headerBg,
            headerText,
            headerCartButtonBG,
            headerCartButtonBorder,
            headerCartButtonCountBG,
            headerCartButtonCountBorder,
            textColor,
            bgColor,
            infoIconsColor,
            tabsButtonBG,
            tabsButtonDefault,
            tabsBorderColor,
            tabsTextColor,
            tabsTextDefaultColor,
            cardsBG,
            cardsText,
            cardsBadgesBg,
            cardsBadgesTextColor,
        } = body

        // Validate required fields
        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
        }

        // Update the restaurant styles in the database
        const updatedRestaurant = await prisma.restaurant.update({
            where: {
                id: restaurantId,
            },
            data: {
                menuPageBackgroundImage,
                headerBg,
                headerText,
                headerCartButtonBG,
                headerCartButtonBorder,
                headerCartButtonCountBG,
                headerCartButtonCountBorder,
                textColor,
                bgColor,
                infoIconsColor,
                tabsButtonBG,
                tabsButtonDefault,
                tabsBorderColor,
                tabsTextColor,
                tabsTextDefaultColor,
                cardsBG,
                cardsText,
                cardsBadgesBg,
                cardsBadgesTextColor,
            },
        })

        return NextResponse.json({
            success: true,
            message: "Restaurant styles updated successfully",
            data: updatedRestaurant,
        })
    } catch (error) {
        console.error("Error updating restaurant styles:", error)

        return NextResponse.json(
            {
                error: "Failed to update restaurant styles",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}
