"use client"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signup } from "@/actions/auth"
import { Checkbox } from "@/components/ui/checkbox"

const SignupSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Confirm Password must be at least 8 characters" }),
    agree: z.boolean().refine((val) => val === true, {
        message: "You must agree to the Privacy Notice and T&Cs",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof SignupSchema>

export default function SignupPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const {
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = (data: SignupFormData) => {
        setError("")
        startTransition(() => {
            const formdata = new FormData()
            formdata.append("email", data.email)
            formdata.append("password", data.password)

            signup(formdata).then((res) => {
                if (res?.error) {
                    setError(res.error)
                } else {
                    router.push("/dashboard")
                }
            })
        })
    }

    return (
        <
            >
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
                <p className="mt-2 text-sm text-slate-600">Sign up for dineri.app to start building your restaurant&apos;s online presence.</p>
            </div>
            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@restaurant.com"
                            className="pl-10 h-[44px]"
                            disabled={isPending}
                            {...register("email")}
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}

                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-[44px]"
                            disabled={isPending}
                            {...register("password")}
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                    {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-[44px]"
                            autoComplete="new-password"
                            disabled={isPending}
                            {...register("confirmPassword")}
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="agree"
                        checked={watch("agree")}
                        onCheckedChange={(checked: boolean) => setValue("agree", checked)}
                        disabled={isPending}
                    />
                    <Label htmlFor="agree" className="text-xs font-normal">
                        By clicking Continue, you agree toDineri.app privacy notice and T&amp;Cs.
                    </Label>
                </div>
                {errors.agree && (
                    <p className="text-xs text-red-600">{errors.agree.message}</p>
                )}

                <Button
                    type="submit"
                    className="w-full  h-[44px] bg-main-blue rounded-full font-poppins cursor-pointer"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                        </>
                    ) : (
                        "Continue"
                    )}
                </Button>
            </form>
            {/* <>
            <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <SocialButton provider="google" />
                <SocialButton provider="facebook" />
            </div>
</> */}

            <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-teal-600 hover:underline">
                    Log in
                </Link>
            </div>
        </>
    )
}
