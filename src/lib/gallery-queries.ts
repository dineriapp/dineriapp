import { UploadedFile } from "@/components/shared/image-upader";
import kyInstance, { handleApiError } from "@/lib/ky";
import { GalleryItem } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GalleryItemSchemaValues } from "./gallery-item.schema";

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

export type GalleryItemType =
    | (GalleryItem & {
        type: "IMAGE";
        file: UploadedFile;
        thumbnail: null;
        youtubeUrl: null;
        youtubeEmbedUrl: null;
    })
    | (GalleryItem & {
        type: "VIDEO";
        file: null;
        thumbnail: string;
        youtubeUrl: string;
        youtubeEmbedUrl: string;
    });

export const galleryApi = {
    // Get all gallery items for a restaurant
    getAll: async (restaurantId: string): Promise<GalleryItemType[]> => {
        try {
            const res = await kyInstance
                .get(`/api/restaurants/${restaurantId}/gallery`)
                .json<ApiResponse<GalleryItemType[]>>();

            if (res && 'success' in res && !res.success) {
                throw new Error(res.error || "Failed to fetch gallery");
            }

            return res.data
        } catch (err) {
            return handleApiError(err, "Failed to fetch gallery items");
        }
    },
    // Create or update gallery item
    save: async (
        restaurantId: string,
        payload: GalleryItemSchemaValues & { id?: string }
    ): Promise<GalleryItemType> => {
        try {
            const res = await kyInstance
                .post(`/api/restaurants/${restaurantId}/gallery`, {
                    json: payload,
                })
                .json<ApiResponse<GalleryItemType>>();

            if (!res.success) {
                throw new Error(res.error || "Failed to save gallery item");
            }
            return res.data!;
        } catch (err) {
            return handleApiError(err, "Failed to save gallery item");
        }
    },
    // Delete gallery item
    delete: async (restaurantId: string, itemId: string): Promise<{ id: string }> => {
        try {
            const res = await kyInstance
                .delete(`/api/restaurants/${restaurantId}/gallery/${itemId}`)
                .json<ApiResponse<{ id: string }>>();

            if (!res.success) {
                throw new Error(res.error || "Failed to delete gallery item");
            }
            return res.data!;
        } catch (err) {
            return handleApiError(err, "Failed to delete gallery item");
        }
    },
    reorder: async (restaurantId: string, items: { id: string; sort_order: number }[]): Promise<void> => {
        try {
            const res = await kyInstance
                .patch(`/api/restaurants/${restaurantId}/gallery/reorder`, {
                    json: { items },
                })
                .json<ApiResponse<void>>();

            if (!res.success) {
                throw new Error(res.error || "Failed to reorder gallery items");
            }
        } catch (err) {
            return handleApiError(err, "Failed to reorder gallery items");
        }
    },
};

const GALLERY_QUERY_KEY = "gallery";

export function useGalleryItems(restaurantId?: string) {
    return useQuery({
        queryKey: [GALLERY_QUERY_KEY, restaurantId],
        queryFn: () => galleryApi.getAll(restaurantId!),
        enabled: !!restaurantId,
        placeholderData: (prev) => prev,
    });
}

export function useGallerySave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ restaurantId, payload }: { restaurantId: string; payload: GalleryItemSchemaValues & { id?: string } }) =>
            galleryApi.save(restaurantId, payload),

        onSuccess: (_, { restaurantId }) => {
            console.log({ restaurantId, })

            queryClient.invalidateQueries({ queryKey: [GALLERY_QUERY_KEY, restaurantId] });
        },
    });
}

export function useGalleryDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ restaurantId, itemId }: { restaurantId: string; itemId: string }) =>
            galleryApi.delete(restaurantId, itemId),

        onSuccess: (_, { restaurantId }) => {
            console.log({ restaurantId, })
            queryClient.invalidateQueries({ queryKey: [GALLERY_QUERY_KEY, restaurantId] });
        },
    });
}

export function useGalleryReorder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ restaurantId, items }: { restaurantId: string; items: { id: string; sort_order: number }[] }) =>
            galleryApi.reorder(restaurantId, items),

        onSuccess: (_, { restaurantId }) => {
            queryClient.invalidateQueries({ queryKey: [GALLERY_QUERY_KEY, restaurantId] });
        },
    });
}