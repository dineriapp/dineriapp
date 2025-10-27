import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";

export default function Page() {
    return (
        <div className="w-full flex flex-col items-center bg-main-blue  justify-center min-h-screen p-5">
            <Card className="w-full max-w-[400px] p-5">
                <div className="flex flex-col items-center justify-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 rounded-full p-3">
                            <MailCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-3 text-center">
                        <h1 className="text-2xl text-center font-bold tracking-tight text-slate-900">
                            Registration Complete
                        </h1>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            Thank you for signing up! We&apos;ve sent a verification link to your email address.
                            Please check your inbox and confirm your email to activate your account.
                        </p>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            If you don’t see the email, check your spam or junk folder.
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

                </div>
            </Card>
        </div>

    );
}
