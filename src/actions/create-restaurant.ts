"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createRestaurant(formData: FormData) {
    const t = await getTranslations('create_restaurant_actions');

    const formSchema = z.object({
        name: z.string().min(1, t("name_required")).max(100),
        slug: z
            .string()
            .min(3, t("slug_too_short"))
            .max(50)
            .regex(/^[a-z0-9-]+$/, t("slug_invalid_format")),
        bio: z.string().max(200).optional(),
    });

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return { error: t("not_authenticated") };
    }

    const parsedData = formSchema.safeParse({
        name: formData.get("name"),
        slug: formData.get("slug"),
        bio: formData.get("bio"),
    });

    if (!parsedData.success) {
        const errors = parsedData.error.flatten().fieldErrors;
        const errorMessage = Object.values(errors).flat().join("\n");
        return { error: errorMessage };
    }

    const { name, slug, bio } = parsedData.data;

    const existingRestaurant = await prisma.restaurant.findUnique({
        where: { slug },
    });

    if (existingRestaurant) {
        return { error: t("slug_taken") };
    }

    const restaurantCount = await prisma.restaurant.count({
        where: {
            user_id: session.user.id,
        },
    });

    if (
        session.user.subscription_plan === "basic" &&
        restaurantCount >= 1
    ) {
        return {
            error: t("basic_plan_limit"),
        };
    }

    await prisma.restaurant.create({
        data: {
            name,
            email: session.user.email,
            slug,
            bio: bio || "",
            user_id: session.user.id,
        },
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
}