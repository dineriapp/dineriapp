import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/login");
  } else {
    return redirect("/dashboard");
  }

}
