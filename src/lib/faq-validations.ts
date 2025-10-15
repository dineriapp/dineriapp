import { getTranslations } from "next-intl/server"
import { z } from "zod"


export async function getCreateFaqCategorySchema() {
    const t = await getTranslations("faq_apis_categories.faq_schema_messages")

    return z.object({
        restaurant_id: z
            .string({ required_error: t("restaurant_id_required") })
            .uuid({ message: t("restaurant_id_invalid") }),

        name: z
            .string({ required_error: t("name_required") })
            .min(1, { message: t("name_min") })
            .max(100, { message: t("name_max") }),

        description: z.string().optional(),
    })
}

export async function getUpdateFaqCategorySchema() {
    const t = await getTranslations("faq_apis_categories.faq_schema_messages")

    return z.object({
        name: z
            .string({ required_error: t("name_required") })
            .min(1, { message: t("name_min") })
            .max(100, { message: t("name_max") }),

        description: z.string().optional(),
    })
}

export async function getCreateFaqSchema() {
    const t = await getTranslations("faq_apis_items.faq_schema_messages")

    return z.object({
        category_id: z
            .string({ required_error: t("category_id_required") })
            .uuid({ message: t("category_id_invalid") }),

        question: z
            .string({ required_error: t("question_required") })
            .min(1, { message: t("question_min") })
            .max(500, { message: t("question_max") }),

        answer: z
            .string({ required_error: t("answer_required") })
            .min(1, { message: t("answer_min") }),

        is_featured: z.boolean().optional().default(false),
    })
}

export async function getUpdateFaqSchema() {
    const t = await getTranslations("faq_apis_items.faq_schema_messages")

    return z.object({
        question: z
            .string({ required_error: t("question_required") })
            .min(1, { message: t("question_min") })
            .max(500, { message: t("question_max") }),

        answer: z
            .string({ required_error: t("answer_required") })
            .min(1, { message: t("answer_min") }),

        is_featured: z.boolean().optional(),
    })
}


export async function getReorderFaqCategorySchema() {
    const t = await getTranslations("faq_apis_categories.faq_schema_messages")

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

export async function getReorderFaqSchema() {
    const t = await getTranslations("faq_apis_items.faq_schema_messages")

    return z.object({
        faqId: z
            .string({ required_error: t("faq_id_required") })
            .uuid({ message: t("faq_id_invalid") }),

        direction: z.enum(["up", "down"], {
            required_error: t("direction_required"),
            invalid_type_error: t("direction_invalid"),
        }),
    })
}
