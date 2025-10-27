"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import clsx from "clsx";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { signIn } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SignInOauthButton from "../sign-in-oauth-button";

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onSubmit",
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            await signIn.email(
                {
                    email: values.email,
                    password: values.password,
                },
                {
                    onError: (ctx) => {
                        console.log(ctx);
                        if (ctx?.error?.code === "EMAIL_NOT_VERIFIED") {
                            toast.error(
                                `Oops! ${ctx.error.message} We've sent a verification link to your email on signup. Please check your inbox.`
                            );
                            router.push("/verify?error=email_not_verified");
                            return;
                        }
                        if (ctx?.error?.message) {
                            toast.error(`Opps! ${ctx.error.message}`);
                        } else if (ctx?.error?.statusText) {
                            toast.error(`Opps! ${ctx.error.statusText}`);
                        } else {
                            toast.error("Something went wrong please try again later");
                        }
                    },
                    onSuccess: () => {
                        toast.success("Login successful. Good to have you back.");
                        router.replace("/dashboard");
                    },
                }
            );
        });
    };

    return (
        <>
            <Link href={"/"} className="">
                <Image
                    src={"/white_logo_name.png"}
                    alt="white_logo_name.png"
                    width={250}
                    height={100}
                    className="w-full max-w-[160px] "
                />
            </Link>
            <Card className="w-full max-w-[400px] mt-1 p-5">

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    {/* Account Not Linked Banner */}
                    {error === "account_not_linked" && (
                        <div
                            className={clsx(
                                "w-full max-w-lg mx-auto px-4 py-3 rounded-md border border-red-300 bg-red-50 text-red-700 flex items-start gap-3 shadow-sm"
                            )}
                        >
                            <AlertCircle className=" h-5 w-5 text-red-500" />
                            <div>
                                <h3 className="font-semibold text-sm">Sign-In Issue</h3>
                                <p className="text-sm mt-1">
                                    This email is already associated with a different sign-in method.
                                    Please try logging in using the correct provider (e.g., Google,
                                    Credentials, etc.) linked to your account.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-1 mb-4 text-start">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h1>
                        <p className="text-sm text-slate-600">
                            Log in to your dineri.app account to manage your restaurant&apos;s online presence.
                        </p>
                    </div>


                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="johndoe@email.com"
                            className={`h-12 border-0 border-b-2 rounded-none bg-transparent focus:border-blue-600 ${errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                            {...register("email")}
                        />
                        {errors.email && (
                            <div className="text-red-500 text-sm">{errors.email.message}</div>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••••"
                                className={`h-12 border-0 border-b-2 rounded-none bg-transparent focus:border-blue-600 outline-none pr-10 ${errors.password ? "border-red-500" : "border-gray-300"
                                    }`}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="text-red-500 text-sm">{errors.password.message}</div>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-12 cursor-pointer text-lg"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : "Log in"}
                    </Button>

                    {/* Forgot Password */}
                    <div className="text-center">
                        <Link
                            href="/forgot-password"
                            className="text-primary-blue hover:text-blue-700 cursor-pointer text-sm underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-black font-medium">OR</span>
                        </div>
                    </div>

                    {/* OAuth */}
                    <SignInOauthButton text="Continue with Google" />

                    {/* Sign Up link */}
                    <div className="text-center">
                        <span className="text-gray-600 text-sm">
                            Don’t have an account?{" "}
                            <Link
                                href="/sign-up"
                                className="text-gray-900 font-semibold pb-[1px] cursor-pointer border-b border-b-black hover:text-blue-600"
                            >
                                Sign up
                            </Link>
                        </span>
                    </div>
                </form>
            </Card>
        </>

    );
}
