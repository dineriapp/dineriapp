"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/supabase/clients/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1, "Restaurant name is required").max(100),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(50)
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    bio: z.string().max(200).optional(),
});

export async function createRestaurant(formData: FormData) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        return { error: "Not authenticated" };
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
        return { error: "Slug is already taken. Please choose another one." };
    }

    // Fetch user
    const prismaUser = await prisma.user.findFirst({
        where: {
            id: data.user.id
        },
        select: {
            subscription_plan: true,
        }
    });

    if (!prismaUser) {
        return { error: "User not found" };
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
            error: "Free Plan allows only one restaurant. Upgrade to add more.",
        };
    }

    // Create new restaurant
    await prisma.restaurant.create({
        data: {
            name,
            slug,
            bio: bio || "",
            user_id: data.user.id,
        },
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
}