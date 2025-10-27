"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";

const ForgotPassword = () => {
    return (
        <div className="w-full flex flex-col items-center bg-main-blue justify-center min-h-screen p-5">


            <Card className="w-full max-w-[400px] p-6 text-center gap-0 shadow-lg">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 rounded-full p-3">
                        <MailCheck className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Check Your Email
                    </h1>

                    <p className="text-sm text-slate-600 leading-relaxed">
                        If an account with that email exists, we&apos;ve sent you a secure link to reset your password.
                        Please check your inbox and follow the instructions to continue.
                    </p>
                </div>

                <Button
                    asChild
                    className="w-full h-12 mt-6 text-lg flex items-center justify-center gap-2"
                >
                    <Link href={"/"}>
                        <ArrowLeft className="h-5 w-5" /> Return to Home
                    </Link>
                </Button>
            </Card>
        </div>
    );
};

export default ForgotPassword;
