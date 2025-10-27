"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resetPassword } from "@/lib/auth/auth-client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((vals) => vals.newPassword === vals.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

type FormValues = z.infer<typeof schema>;

export default function PasswordResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  // If there's no token, push to login on mount
  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  if (!token) return null;

  const onSubmit = async (values: FormValues) => {
    setIsPending(true);
    try {
      await resetPassword({
        newPassword: values.newPassword,
        token,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(`Oops! ${ctx.error.message}`);
          },
          onSuccess: () => {
            toast.success(
              "Your password has been reset successfully. Please log in with your new password."
            );
            router.replace("/login");
          },
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
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
      <Card className="w-full max-w-[400px] p-5 mt-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1 mb-6 text-start">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reset your password
            </h1>
            <p className="text-sm text-slate-600">
              Enter and confirm your new password below to secure your account.
            </p>
          </div>
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-gray-700 font-medium">
              New password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••••••••"
                disabled={isPending}
                className={`h-12 border-0 border-b-2 rounded-none bg-transparent focus:border-blue-600 outline-none pr-10 ${errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                aria-invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowNewPassword((s) => !s)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <div className="text-red-500">{errors.newPassword.message}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              Confirm new password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••••"
                disabled={isPending}
                className={`h-12 border-0 border-b-2 rounded-none bg-transparent focus:border-blue-600 outline-none pr-10 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="text-red-500">{errors.confirmPassword.message}</div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 cursor-pointer text-lg "
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Reset password"}
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              type="button"
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
