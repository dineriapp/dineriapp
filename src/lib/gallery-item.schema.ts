import { z } from "zod";
import { uploadedFileSchema } from "./uplaod-file.schema";

export const GalleryItemSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("IMAGE"),
        title: z.string().min(1, "Title is required"),
        file: z
            .array(uploadedFileSchema)
            .min(1, "Image file is required")
            .max(1, "Only one image allowed"),
        link: z.string().url("Invalid URL").optional(),
        thumbnail: z.string().optional(),
        youtubeUrl: z.string().optional(),
        youtubeEmbedUrl: z.string().optional(),
    }),
    z.object({
        type: z.literal("VIDEO"),
        title: z.string().min(1, "Title is required"),
        youtubeUrl: z.string().url("Valid YouTube URL is required"),
        youtubeEmbedUrl: z.string().optional(),
        thumbnail: z.string().optional(),
        file: z
            .array(uploadedFileSchema),
        link: z.string().url("Invalid URL").optional(),
    }),
]);

export type GalleryItemSchemaValues = z.infer<typeof GalleryItemSchema>;