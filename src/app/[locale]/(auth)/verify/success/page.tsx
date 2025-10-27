import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";

export default function Page() {
    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen p-5 bg-main-blue">
            <Card className="w-full max-w-[400px] p-5">
                <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 rounded-full p-3">
                            <MailCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl text-center font-bold tracking-tight text-slate-900">                            Verification Link Sent
                        </h1>

                        <p className="text-sm text-center text-slate-600 leading-relaxed">
                            We&apos;ve successfully re-sent the verification email to your inbox. Please check your email and click the link to verify your account.
                        </p>

                        <p className="text-sm text-center text-slate-600 leading-relaxed">
                            Didn&apos;t receive the email? Make sure to check your spam or junk folder as well.
                        </p>
                    </div>

                    <Button
                        asChild
                        className="w-full h-12 cursor-pointer text-lg"
                    >
                        <Link href={"/"}>
                            <ArrowLeft /> Return to Home
                        </Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
