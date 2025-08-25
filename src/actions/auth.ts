'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/supabase/clients/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    const data = {
        email,
        password,
    }

    const { error } = await supabase.auth.signInWithPassword(data)


    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    // 1) Sign up
    const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        },
    });

    if (signUpError) {
        // Prefer robust matching over brittle message strings
        const msg =
            signUpError.message?.toLowerCase().includes("registered") ||
                signUpError.status === 400
                ? "An account with this email already exists."
                : signUpError.message || "Failed to create the account.";
        return { error: msg };
    }

    // 2) Try sign-in (may fail if confirmation is required)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        const friendly =
            signInError.message?.toLowerCase().includes("confirm")
                ? "Please check your inbox and confirm your email before logging in."
                : signInError.message || "Could not sign you in.";
        return { error: friendly };
    }

    // 3) We’re signed in — fetch the authed user and upsert into Prisma
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
        return { error: "Could not load your user after sign-in." };
    }

    // IMPORTANT: Ensure your Prisma schema supports string UUIDs for `id`
    // If your `User.id` is NOT a string UUID, remove `id` here and only store `supabase_id`.
    await prisma.user.upsert({
        where: { id: user.id },
        update: {
            email: user.email ?? email,
            supabase_id: user.id,
        },
        create: {
            id: user.id, // keep only if your Prisma id is a String/UUID
            supabase_id: user.id,
            email: user.email ?? email,
        },
    });

    revalidatePath("/dashboard", "layout");
    redirect("/dashboard");
}

// export async function signup(formData: FormData) {
//     const supabase = await createClient()

//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;

//     if (!email || !password) {
//         return { error: "Email and password are required." };
//     }

//     const { data, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//             emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
//         },
//     })

//     // Handle sign-up errors
//     if (signUpError) {
//         const message =
//             signUpError.message === "User already registered"
//                 ? "An account with this email already exists."
//                 : signUpError.message;
//         return { error: message };
//     }

//     // Sync with local DB
//     if (data.user) {
//         try {
//             const existingUser = await prisma.user.findFirst({
//                 where: {
//                     OR: [
//                         { supabase_id: data.user.id },
//                         { email: data.user.email! },
//                         { id: data.user.id, },
//                     ],
//                 },
//             })

//             if (!existingUser) {
//                 await prisma.user.create({
//                     data: {
//                         email: data.user.email!,
//                         supabase_id: data.user.id,
//                         id: data.user.id,
//                     },
//                 })
//             }
//         } catch (err) {
//             console.error(
//                 '❌ Failed to create user in local DB:',
//                 err instanceof Error ? err.message : err
//             )
//         }
//     }

//     // Attempt to sign in immediately
//     const { error: signInError } = await supabase.auth.signInWithPassword({
//         email, password,

//     },);

//     if (signInError) {
//         return {
//             error:
//                 signInError.message === "Email not confirmed"
//                     ? "Please check your inbox and confirm your email before logging in."
//                     : signInError.message,
//         };
//     }

//     revalidatePath('/dashboard', 'layout')
//     redirect('/dashboard')
// }

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}