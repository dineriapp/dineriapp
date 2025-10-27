import { headers } from "next/headers";
import { auth } from "./auth";

export const VALID_DOMAINS = () => {
    const domains = ["gmail.com", "yahoo.com", "outlook.com"];

    if (process.env.NODE_ENV === "development") {
        domains.push("example.com")
    }

    return domains
}
export function normalizeName(name: string) {
    return name
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[^a-zA-Z\s'-]/g, "")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function checkAuth() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user) {
            return null;
        }

        return session
    } catch (error) {
        console.error("[checkAuth] Error verifying session:", error);
        return null;
    }
}