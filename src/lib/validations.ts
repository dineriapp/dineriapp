import { getTranslations } from "next-intl/server"
import { z } from "zod"

export async function getCreateLinkSchema() {
    const t = await getTranslations("links_apis.link_schema_messages")

    return z.object({
        restaurant_id: z
            .string({ required_error: t("restaurant_id_required") })
            .uuid({ message: t("restaurant_id_invalid") }),

        title: z
            .string({ required_error: t("title_required") })
            .min(1, { message: t("title_min") })
            .max(255, { message: t("title_max") }),

        url: z
            .string({ required_error: t("url_required") })
            .url({ message: t("url_invalid") }),

        iconSlug: z
            .string({ required_error: t("iconSlug_required") })
            .min(1, { message: t("iconSlug_min") })
            .max(255, { message: t("iconSlug_max") }),
    })
}

function formatUrl(url: string): string {
    const trimmedUrl = url.trim()
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        return `https://${trimmedUrl}`
    }
    return trimmedUrl
}

export { formatUrl }

export async function getUpdateLinkSchema() {
    const t = await getTranslations("links_apis.link_schema_messages")

    return z.object({
        title: z
            .string({ required_error: t("title_required") })
            .min(1, { message: t("title_min") })
            .max(255, { message: t("title_max") }),

        url: z
            .string({ required_error: t("url_required") })
            .url({ message: t("url_invalid") }),

        iconSlug: z
            .string({ required_error: t("iconSlug_required") })
            .min(1, { message: t("iconSlug_min") })
            .max(255, { message: t("iconSlug_max") })
    })
}

export async function getReorderLinkSchema() {
    const t = await getTranslations("links_apis.link_schema_messages")

    return z.object({
        linkId: z
            .string({ required_error: t("link_id_required") })
            .uuid({ message: t("link_id_invalid") }),

        direction: z.enum(["up", "down"], {
            required_error: t("direction_required"),
            invalid_type_error: t("direction_invalid")
        })
    })
}

export async function getCreateMenuCategorySchema() {
    const t = await getTranslations("menu_apis.categories.category_schema_messages")

    return z.object({
        restaurant_id: z
            .string({ required_error: t("restaurant_id_required") })
            .uuid({ message: t("restaurant_id_invalid") }),

        name: z
            .string({ required_error: t("name_required") })
            .min(1, { message: t("name_min") })
            .max(255, { message: t("name_max") }),

        description: z.string().optional(),

        show_in_quick_menu: z.boolean().optional().default(false),
    })
}

export async function getUpdateMenuCategorySchema() {
    const t = await getTranslations("menu_apis.categories.category_schema_messages")

    return z.object({
        name: z
            .string({ required_error: t("name_required") })
            .min(1, { message: t("name_min") })
            .max(255, { message: t("name_max") }),

        description: z.string().optional(),

        show_in_quick_menu: z.boolean().optional().default(false),
    })
}


export async function getReorderMenuCategorySchema() {
    const t = await getTranslations("menu_apis.categories.category_schema_messages")

    return z.object({
        categoryId: z
            .string({ required_error: t("category_id_required") })
            .uuid({ message: t("category_id_invalid") }),

        direction: z.enum(["up", "down"], {
            required_error: t("direction_required"),
            invalid_type_error: t("direction_invalid"),
        }),
    })
}

// Menu Item schemas

export async function getCreateItemSchema() {
    const t = await getTranslations("menu_apis.items.schema_messages")

    return z.object({
        category_id: z
            .string({ required_error: t("category_id_required") })
            .uuid({ message: t("category_id_invalid") }),

        name: z
            .string({ required_error: t("name_required") })
            .min(1, { message: t("name_min") })
            .max(255, { message: t("name_max") }),

        description: z.string().optional(),

        show_in_quick_menu: z.boolean().optional().default(false),

        price: z
            .number({ required_error: t("price_required") })
            .min(0, { message: t("price_min") }),

        allergens: z.array(z.string()).default([]),

        is_halal: z.boolean().optional().default(false),

        allergen_info: z.string().optional(),

        image: z.string().optional(),

        addons: z
            .array(
                z.object({
                    name: z
                        .string({ required_error: t("addon_name_required") })
                        .min(1, { message: t("addon_name_min") }),
                    price: z
                        .number({ required_error: t("addon_price_required") })
                        .nonnegative({ message: t("addon_price_nonnegative") }),
                })
            )
            .optional(),
    })
}

export async function getUpdateItemSchema() {
    const t = await getTranslations("menu_apis.items.schema_messages")

    return z.object({
        name: z
            .string({ required_error: t("name_required") })
            .min(1, { message: t("name_min") })
            .max(255, { message: t("name_max") }),

        description: z.string().optional(),

        show_in_quick_menu: z.boolean().optional().default(false),

        price: z
            .number({ required_error: t("price_required") })
            .min(0, { message: t("price_min") }),

        allergens: z.array(z.string()).default([]),

        is_halal: z.boolean().optional().default(false),

        allergen_info: z.string().optional(),

        image: z.string().optional(),

        addons: z
            .array(
                z.object({
                    name: z
                        .string({ required_error: t("addon_name_required") })
                        .min(1, { message: t("addon_name_min") }),
                    price: z
                        .number({ required_error: t("addon_price_required") })
                        .nonnegative({ message: t("addon_price_nonnegative") }),
                })
            )
            .optional(),
    })
}

export async function getReorderItemSchema() {
    const t = await getTranslations("menu_apis.items.schema_messages")

    return z.object({
        itemId: z
            .string({ required_error: t("item_id_required") })
            .uuid({ message: t("item_id_invalid") }),
        direction: z.enum(["up", "down"], {
            required_error: t("direction_required"),
            invalid_type_error: t("direction_invalid"),
        }),
    })
}

export async function getCreateEventSchema() {
    const t = await getTranslations("event_api_messages");

    return z.object({
        restaurant_id: z
            .string({ required_error: t("restaurant_id_required") })
            .uuid({ message: t("restaurant_id_invalid") }),

        title: z
            .string({ required_error: t("title_required") })
            .min(1, { message: t("title_min") })
            .max(200, { message: t("title_max") }),

        description: z.string().optional(),

        date: z
            .string({ required_error: t("date_required") })
            .datetime({ message: t("date_invalid") }),

        ticket_url: z
            .string()
            .url({ message: t("ticket_url_invalid") })
            .optional(),
    });
}

export async function getUpdateEventSchema() {
    const t = await getTranslations("event_api_messages");

    return z.object({
        title: z
            .string({ required_error: t("title_required") })
            .min(1, { message: t("title_min") })
            .max(200, { message: t("title_max") }),

        description: z.string().optional(),

        date: z
            .string({ required_error: t("date_required") })
            .datetime({ message: t("date_invalid") }),

        ticket_url: z
            .string()
            .url({ message: t("ticket_url_invalid") })
            .optional(),
    });
}

export async function getReorderEventSchema() {
    const t = await getTranslations("event_api_messages")

    return z.object({
        eventId: z
            .string({ required_error: t("event_id_required") })
            .uuid({ message: t("event_id_invalid") }),

        direction: z.enum(["up", "down"], {
            required_error: t("direction_required"),
            invalid_type_error: t("direction_invalid"),
        }),
    })
}



export const updateStripeSchema = z.object({
    stripe_public_key: z
        .string()
        .min(1, "Public key is required")
        .startsWith("pk_", "Invalid public key format"),
    stripe_secret_key: z
        .string()
        .min(1, "Secret key is required")
        .startsWith("sk_", "Invalid secret key format"),
})


export const taxPercentageSchema = z.object({
    // accepts string or number, coerces to number
    tax_percentage: z.coerce
        .number()
        .min(0, "Tax percentage cannot be negative")
        .max(100, "Tax percentage cannot exceed 100")
        .transform((n) => Math.round(n * 100) / 100), // round to 2 decimals
});

export const reservationSchema = z.object({
    restaurantId: z.string().uuid("Please select a valid restaurant"),
    date: z.string().refine((val) => {
        const selectedDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    }, "Date must be today or in the future"),
    time: z
        .string()
        .regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, "Time must be in HH:MM AM/PM format"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email"),
    arival_time: z.string().optional().or(z.literal("")),
    message: z.string().min(10, "Message must be at least 10 characters").max(1000),
    phoneNumber: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Please enter a valid phone number").optional().or(z.literal("")),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
