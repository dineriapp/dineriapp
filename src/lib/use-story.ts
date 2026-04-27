import { StoryLine } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance, { handleApiError } from "./ky";
import { StoryLineSchemaValues } from "./story-line.schema";

export type ApiResponse<T> =
    | {
        success: true;
        data: T;
        error?: never;
    }
    | {
        success: false;
        error: string;
        data?: never;
    };

export const StoryLineApi = {
    // Publish Designer
    save: async (
        payload: StoryLineSchemaValues & { id?: string }
    ): Promise<StoryLine> => {
        try {
            const res = await kyInstance
                .post(`/api/restaurants/${payload.id}/story-line`, {
                    json: payload,
                })
                .json<ApiResponse<StoryLine>>();

            if (!res.success) {
                throw new Error(res.error || "Failed to publish vision");
            }

            return res.data!;
        } catch (err) {
            return handleApiError(err, "Failed to publish vision");
        }
    },
};

const VISION_QUERY_KEY = "vision"

export function useStorySave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: StoryLineSchemaValues & { id?: string }) =>
            StoryLineApi.save(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [VISION_QUERY_KEY] });
        },
    });
}
