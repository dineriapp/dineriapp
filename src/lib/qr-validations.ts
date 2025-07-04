import { z } from "zod"

export const createQRCodeSchema = z
    .object({
        name: z.string().min(1, "Name is required").max(255, "Name is too long"),
        type: z.enum(["restaurant_page", "link", "custom"]),
        link_id: z.string().uuid().or(z.literal("")).optional(),
        custom_url: z.string().url().or(z.literal("")).optional(),
        size: z.number().min(100).max(1000).default(300),

        color: z
            .string()
            .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
            .default("#000000"),
        include_logo: z.boolean().default(true),
        include_frame: z.boolean().default(true),
        frame_text: z.string().max(100).optional(),
    })
    .refine(
        (data) => {
            if (data.type === "link" && !data.link_id) {
                return false
            }
            if (data.type === "custom" && !data.custom_url) {
                return false
            }
            return true
        },
        {
            message: "Link ID is required for link type, Custom URL is required for custom type",
        },
    )

export const updateQRCodeSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    is_active: z.boolean().optional(),
    size: z.number().min(100).max(1000).optional(),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .optional(),
    include_logo: z.boolean().optional(),
    include_frame: z.boolean().optional(),
    frame_text: z.string().max(100).optional(),
})

export type CreateQRCodeInput = z.infer<typeof createQRCodeSchema>
export type UpdateQRCodeInput = z.infer<typeof updateQRCodeSchema>
