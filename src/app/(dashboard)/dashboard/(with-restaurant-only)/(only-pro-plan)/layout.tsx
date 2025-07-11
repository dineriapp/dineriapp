"use server"
import prisma from "@/lib/prisma";
import { createClient } from "@/supabase/clients/server";
import { redirect } from "next/navigation";

export default async function WithProPlanLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/login')
    }

    const prismaUser = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    })

    if (!prismaUser) redirect("/dashbaord")
    if (prismaUser.subscription_plan === "basic") redirect("/dashbaord")

    return (
        children
    );
}
