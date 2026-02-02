// hooks/useReservationSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "./ky";
import { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types";



export function useReservationSettings(restaurantId: string) {
    return useQuery({
        queryKey: ["reservation-settings", restaurantId],
        queryFn: async () => {
            const res = await kyInstance
                .get(`/api/reservations/settings?restaurantId=${restaurantId}`)
                .json<{ success: boolean; settings: SettingsState }>();
            return res.settings;
        },
        enabled: !!restaurantId,
    });
}

export function useSaveReservationSettings(restaurantId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings: SettingsState) => {
            const res = await kyInstance
                .post("/api/reservations/settings", {
                    json: { restaurantId, settings },
                })
                .json<{ success: boolean; message: string }>();
            return res;
        },
        onSuccess: () => {
            // ⏳ automatically refresh GET query after saving
            queryClient.invalidateQueries({
                queryKey: ["reservation-settings", restaurantId],
            });
        },
    });
}
