import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky"; // your KY instance
import { GetRestaurantsResponse } from "@/types";

export function useRestaurants() {
    return useQuery({
        queryKey: ["restaurants-all"],
        queryFn: async (): Promise<GetRestaurantsResponse> => {
            return await kyInstance.get("/api/restaurants/all").json<GetRestaurantsResponse>();
        },
    });
}

export function useRecentActivity(restaurantId: string | undefined) {
    return useQuery({
        queryKey: ["recent-activity", restaurantId],
        queryFn: async () => {
            const res = await fetch(`/api/activity/${restaurantId}/recent`);
            if (!res.ok) throw new Error("Failed to fetch activity");
            return res.json() as Promise<{
                activity: { type: string; createdAt: string; message: string }[];
            }>;
        },
        enabled: !!restaurantId, // only run if ID is available
    });
}
