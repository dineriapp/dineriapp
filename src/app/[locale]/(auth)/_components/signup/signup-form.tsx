"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ErrorCodeBetterAuth } from "@/lib/auth/auth";
import { signUp } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SignInOauthButton from "../sign-in-oauth-button";

const schema = z.object({
    name: z.string().min(1, "name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        } as any,
        mode: "onSubmit",
    });

    // Forgot password
    const handleForgotPassword = () => {
        console.log("Forgot password clicked");
    };

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                // Proceed with signup
                await signUp.email(
                    {
                        email: values.email,
                        password: values.password,
                        name: `${values.name}`.trim(),
                    },
                    {
                        onError: (ctx) => {
                            const errCode =
                                (ctx?.error?.code as ErrorCodeBetterAuth) || "UNKNOW";
                            if (errCode === "USER_ALREADY_EXISTS") {
                                toast.error("Oops! Looks like email is already in use.");
                            } else if (ctx?.error?.message) {
                                toast.error(ctx.error.message);
                            } else if (ctx?.error?.statusText) {
                                toast.error(ctx.error.statusText);
                            } else {
                                toast.error("Something went wrong. Please try again later.");
                            }
                        },
                        onSuccess: async () => {
                            toast.success(
                                "Registration complete. We've sent you a verification link. Please check your email."
                            );
                            router.replace("/sign-up/success");
                        },
                    }
                );
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong during resume upload.");
            }
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
            <Card className="w-full max-w-[400px] p-5  mt-1">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div className="space-y-1 mb-6 text-start">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Create your account
                        </h1>
                        <p className="text-sm text-slate-600">
                            Sign up for dineri.app to start building your restaurant&apos;s online presence.
                        </p>
                    </div>
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Deo"
                            className={`h-12 border-0 border-b-2 rounded-none bg-transparent focus:border-blue-600 ${errors.name ? "border-red-500" : "border-gray-300"
                                }`}
                            {...register("name")}
                        />
                        {errors.name && (
                            <div className="text-red-500">{errors.name.message}</div>
                        )}
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
                            <div className="text-red-500">{errors.email.message}</div>
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
                                className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="text-red-500">{errors.password.message}</div>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-12 cursor-pointer text-lg"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : "Sign up"}
                    </Button>

                    {/* Forgot Password */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-primary-blue hover:text-blue-700 cursor-pointer underline"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-black font-medium">OR</span>
                        </div>
                    </div>

                    {/* OAuth */}
                    <SignInOauthButton text="Continue with Google" />

                    {/* Sign In link */}
                    <div className="text-center">
                        <span className="text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-gray-900 font-semibold pb-[1px] cursor-pointer border-b border-b-black hover:text-blue-600"
                            >
                                Log in
                            </Link>
                        </span>
                    </div>
                </form>
            </Card>
        </>

    );
}
