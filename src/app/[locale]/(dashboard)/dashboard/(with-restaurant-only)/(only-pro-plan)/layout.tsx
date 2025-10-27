"use server"
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WithProPlanLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) redirect("/dashbaord")
    if (session.user.subscription_plan === "basic") redirect("/dashbaord")

    return (
        children
    );
}
