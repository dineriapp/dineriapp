import prisma from "@/lib/prisma";
import AccessCheker from "./access-cheker";
import { createClient } from "@/supabase/clients/server";

export default async function Page() {
    const supabase = await createClient();

    // ✅ Get the authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ✅ If no user is logged in, block access early
    if (!user) {
        return <>Not Authorized</>;
    }

    // ✅ Fetch matching user from your Prisma DB
    const prismaUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    // ✅ Optional: handle case where user exists in Supabase but not in your DB
    if (!prismaUser) {
        return <>User not found in the system</>;
    }

    // ✅ Render secured component
    return <AccessCheker prismaUser={prismaUser} />;
}
