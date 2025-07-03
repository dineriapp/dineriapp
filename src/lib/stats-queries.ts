import { useQuery } from "@tanstack/react-query"
import ky from "./ky"

interface LinkStat {
    id: string
    title: string
    url: string
    view_count: number
    unique_views: number
}

interface DeviceStat {
    device: string
    count: number
    percentage: number
}

interface StatsData {
    restaurant: {
        id: string
        name: string
        slug: string
    }
    overview: {
        totalViews: number
        totalUniqueViews: number
        totalPageViews: number
        uniquePageViews: number
        recentLinkViews: number
        recentPageViews: number
    }
    linkStats: LinkStat[]
    deviceStats: DeviceStat[]
    lastUpdated: string
}

export function useStats(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["stats", restaurantId],
        queryFn: async () => {
            const response = await ky.get(`/api/stats?restaurant_id=${restaurantId}`).json<{ data: StatsData }>()
            return response.data
        },
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
        staleTime: 25000, // Consider data stale after 25 seconds
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        enabled: !!restaurantId, // Only run query if restaurantId is provided
    })
}
