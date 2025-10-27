import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { SendVerificationEmailForm } from "../_components/verify/send-verification-email-form";

interface PageProps {
    searchParams: Promise<{ error: string }>;
}

export default async function Page({ searchParams }: PageProps) {
    const error = (await searchParams).error;

    if (!error) redirect("/dashboard");

    const formatError = (text: string) =>
        text
            .replace(/_/g, " ")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen p-5 bg-main-blue">
            <Card className="w-full max-w-[400px] p-5">
                <div className="w-full ">
                    <div className="py-2 max-w-screen-lg mx-auto space-y-3">
                        <div className="space-y-1">
                            <h1 className="text-2xl text-start font-bold tracking-tight text-slate-900">
                                Verify Your Email
                            </h1>

                            <p className="text-sm text-slate-600 leading-relaxed">
                                {error === "email_not_verified" ? (
                                    <>
                                        Your email address is not verified yet. We’ve sent you a verification link — please check your inbox. If you didn’t receive it, you can request a new one below.
                                    </>
                                ) : (
                                    <>
                                        {formatError(error)}. Please request a new verification email below if needed.
                                    </>
                                )}
                            </p>
                        </div>
                        <SendVerificationEmailForm />
                    </div>
                </div>
            </Card>
        </div>
    );
}
