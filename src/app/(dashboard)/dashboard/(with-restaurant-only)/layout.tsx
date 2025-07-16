import prisma from "@/lib/prisma";
import { createClient } from "@/supabase/clients/server";
import { redirect } from "next/navigation";
import { DashboardHeaderClientSide } from "../../_components/header-client-side";

export default async function WithResttaurantLayout({
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

    const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)

    if (restaurantError || !restaurants || restaurants.length === 0) {
        redirect('/dashboard/create')
    }

    const prismaUser = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    })

    if (!prismaUser) redirect("/login")

    return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <DashboardHeaderClientSide user={user} prismaUser={prismaUser} />
                {children}
            </div>
    );
}
