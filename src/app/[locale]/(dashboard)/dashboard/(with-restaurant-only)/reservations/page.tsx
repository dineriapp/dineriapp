import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import AccessCheker from "./access-cheker";

export default async function Page() {

    // ✅ Get the authenticated user
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // ✅ If no user is logged in, block access early
    if (!session?.user) {
        return <>Not Authorized</>;
    }

    // ✅ Render secured component
    return <AccessCheker />;
}
