import { z } from "zod";
import { uploadedFileSchema } from "./uplaod-file.schema";

export const StoryLineSchema =
    z.object({
        title: z.string().min(1, "Button text is required"),
        description: z.string().min(1, "Content is required"),
        file: z
            .array(uploadedFileSchema)
            .min(1, "Image is required")
            .max(1, "Only one image allowed"),
        show: z.boolean()
    });

export type StoryLineSchemaValues = z.infer<typeof StoryLineSchema>;