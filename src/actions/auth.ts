'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/supabase/clients/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()
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
    const supabase = await createClient()

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        },
    })

    if (signUpError) {
        const message =
            signUpError.message === "User already registered"
                ? "An account with this email already exists."
                : signUpError.message;
        return { error: message };
    }

    if (data.user) {
        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { supabase_id: data.user.id },
                        { email: data.user.email! },
                        { id: data.user.id, },
                    ],
                },
            })

            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        email: data.user.email!,
                        supabase_id: data.user.id,
                        id: data.user.id,
                    },
                })
            }
        } catch (err) {
            console.error(
                '❌ Failed to create user in local DB:',
                err instanceof Error ? err.message : err
            )
        }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email, password,

    },);

    if (signInError) {
        return {
            error:
                signInError.message === "Email not confirmed"
                    ? "Please check your inbox and confirm your email before logging in."
                    : signInError.message,
        };
    }

    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}