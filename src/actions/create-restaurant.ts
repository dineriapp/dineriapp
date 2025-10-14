"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/supabase/clients/server";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
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

    const supabase = await createClient()
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
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

    // Check if slug is already taken
    const existingRestaurant = await prisma.restaurant.findUnique({
        where: { slug },
    });

    if (existingRestaurant) {
        return { error: t("slug_taken") };
    }

    // Fetch user
    const prismaUser = await prisma.user.findFirst({
        where: {
            id: data.user.id
        },
        select: {
            subscription_plan: true,
            email: true
        }
    });

    if (!prismaUser) {
        return { error: t("user_not_found") };
    }

    // Count how many restaurants the user already has
    const restaurantCount = await prisma.restaurant.count({
        where: {
            user_id: data.user.id,
        },
    });

    // Enforce plan restriction: only 1 restaurant for basic plan
    if (
        prismaUser.subscription_plan === "basic" &&
        restaurantCount >= 1
    ) {
        return {
            error: t("basic_plan_limit"),
        };
    }

    // Create new restaurant
    await prisma.restaurant.create({
        data: {
            name,
            email: prismaUser.email,
            slug,
            bio: bio || "",
            user_id: data.user.id,
        },
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
}