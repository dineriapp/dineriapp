"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { forgetPassword } from "@/lib/auth/auth-client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface ForgotPasswordFormValues {
  email: string;
}

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsPending(true);

    await forgetPassword({
      email: values.email,
      redirectTo: "/password-reset",
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onError: (ctx) => {
          toast.error(ctx?.error?.message ?? "Something went wrong.");
        },
        onSuccess: () => {
          toast.success(
            "If that email exists, we've sent you a password reset link."
          );
          router.push("/forgot-password/success");
        },
      },
    }).catch((err) => {
      console.error(err);
      toast.error("Something went wrong. Please try again later.");
    }).finally(() => setIsPending(false));
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
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Forgot your password?
            </h1>
            <p className="text-sm text-slate-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
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
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <div className="text-red-500 text-sm">{errors.email.message}</div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 "
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Reset password"}
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href={"/login"}
              className="text-primary-blue hover:text-blue-700 cursor-pointer underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      </Card>
    </>

  );
}
