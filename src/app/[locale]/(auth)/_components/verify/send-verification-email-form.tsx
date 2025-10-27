"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendVerificationEmail } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const SendVerificationEmailForm = () => {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
        evt.preventDefault();
        const formData = new FormData(evt.currentTarget);
        const email = String(formData.get("email"));

        if (!email) return toast.error("Please enter your email.");

        await sendVerificationEmail({
            email,
            callbackURL: "/verify",
            fetchOptions: {
                onRequest: () => {
                    setIsPending(true);
                },
                onResponse: () => {
                    setIsPending(false);
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                },
                onSuccess: () => {
                    toast.success("Verification email sent successfully.");
                    router.push("/verify/success");
                },
            },
        });
    }

    return (
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" placeholder="Enter your email"
                    className={`h-12 border-0 border-b-2 w-full bg-gray-50 rounded-none focus:border-blue-600 `}
                />
            </div>
            <Button
                disabled={isPending}
                type="submit"
                className="w-full h-12 cursor-pointer text-lg "
            >
                Resend Verification Email
            </Button>

        </form>
    );
};