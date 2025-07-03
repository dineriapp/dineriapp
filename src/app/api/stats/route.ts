import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get restaurant_id from query parameters
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurant_id")

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
        }

        // Get all links with their views
        const links = await prisma.link.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            include: {
                views: {
                    select: {
                        id: true,
                        ip_hash: true,
                        user_agent: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                sort_order: "asc",
            },
        })

        // Calculate link statistics
        const linkStats = links.map((link) => {
            const totalViews = link.views.length
            const uniqueViews = new Set(link.views.map((view) => view.ip_hash)).size

            return {
                id: link.id,
                title: link.title,
                url: link.url,
                view_count: totalViews,
                unique_views: uniqueViews,
            }
        })

        // Calculate totals
        const totalViews = linkStats.reduce((sum, stat) => sum + stat.view_count, 0)
        const totalUniqueViews = linkStats.reduce((sum, stat) => sum + stat.unique_views, 0)

        // Get all link views for device analysis
        const allLinkViews = await prisma.linkView.findMany({
            where: {
                link: {
                    restaurant_id: restaurantId,
                },
            },
            select: {
                user_agent: true,
                createdAt: true,
            },
        })
        // Get all restaurent views for device analysis
        const allResViews = await prisma.restaurantView.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            select: {
                user_agent: true,
                createdAt: true,
            },
        })

        // Analyze device types from user agents
        const deviceStats = analyzeDeviceStats(allResViews)

        // Get restaurant page views
        const restaurantViews = await prisma.restaurantView.findMany({
            where: {
                restaurant_id: restaurantId,
            },
            select: {
                ip_hash: true,
                user_agent: true,
                createdAt: true,
            },
        })

        const totalPageViews = restaurantViews.length
        const uniquePageViews = new Set(restaurantViews.map((view) => view.ip_hash)).size

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentLinkViews = allLinkViews.filter((view) => new Date(view.createdAt) >= sevenDaysAgo).length

        const recentPageViews = restaurantViews.filter((view) => new Date(view.createdAt) >= sevenDaysAgo).length

        const stats = {
            restaurant: {
                id: restaurantId,
                name: restaurantId,
                slug: restaurantId,
            },
            overview: {
                totalViews,
                totalUniqueViews,
                totalPageViews,
                uniquePageViews,
                recentLinkViews,
                recentPageViews,
            },
            linkStats,
            deviceStats,
            lastUpdated: new Date().toISOString(),
        }

        return NextResponse.json({ data: stats })
    } catch (error) {
        console.error("Stats API error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}

function analyzeDeviceStats(views: { user_agent: string | null }[]) {
    const deviceCounts = {
        mobile: 0,
        desktop: 0,
        tablet: 0,
    }

    views.forEach((view) => {
        if (!view.user_agent) {
            deviceCounts.desktop++ // Default to desktop if no user agent
            return
        }

        const ua = view.user_agent.toLowerCase()

        if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
            deviceCounts.mobile++
        } else if (ua.includes("tablet") || ua.includes("ipad")) {
            deviceCounts.tablet++
        } else {
            deviceCounts.desktop++
        }
    })

    const total = deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet

    if (total === 0) {
        return [
            { device: "Mobile", count: 0, percentage: 0 },
            { device: "Desktop", count: 0, percentage: 0 },
            { device: "Tablet", count: 0, percentage: 0 },
        ]
    }

    return [
        {
            device: "Mobile",
            count: deviceCounts.mobile,
            percentage: Math.round((deviceCounts.mobile / total) * 100 * 10) / 10,
        },
        {
            device: "Desktop",
            count: deviceCounts.desktop,
            percentage: Math.round((deviceCounts.desktop / total) * 100 * 10) / 10,
        },
        {
            device: "Tablet",
            count: deviceCounts.tablet,
            percentage: Math.round((deviceCounts.tablet / total) * 100 * 10) / 10,
        },
    ]
}
