"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { login } from "@/actions/auth"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"




export default function LoginPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const t = useTranslations("login_page")

    const loginSchema = z.object({
        email: z.string().email({ message: t("invalid_email") }),
        password: z.string().min(8, { message: t("password_min_length") }),
        rememberMe: z.boolean().optional(),
    })

    type LoginFormData = z.infer<typeof loginSchema>

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    const onSubmit = (data: LoginFormData) => {
        setError("")
        startTransition(() => {
            const formdata = new FormData()
            formdata.append("email", data.email)
            formdata.append("password", data.password)

            login(formdata).then((res) => {
                if (res?.error) {
                    setError(res.error)
                } else {
                    router.push("/dashboard")
                }
            })
        })
    }

    return (
        <>
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {t("welcome_back")}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    {t("description")}
                </p>
            </div>
            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="email">
                        {t("email_label")}
                    </Label>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="email"
                            type="email"
                            placeholder={t("email_placeholder")}
                            className="pl-10 h-[44px]"
                            disabled={isPending}
                            {...register("email")}
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">
                            {t("password_label")}
                        </Label>
                        <Link href="/forgot-password" className="text-xs text-teal-600 hover:underline">
                            {t("forgot_password")}
                        </Link>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="password"
                            type="password"
                            placeholder={t("password_placeholder")}
                            className="pl-10 h-[44px]"
                            disabled={isPending}
                            {...register("password")}
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                    {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="rememberMe"
                        checked={watch("rememberMe")}
                        onCheckedChange={(checked: boolean) => setValue("rememberMe", checked)}
                        disabled={isPending}
                    />
                    <Label htmlFor="rememberMe" className="text-sm font-normal">
                        {t("remember_me")}
                    </Label>
                </div>

                <Button
                    type="submit"
                    className="w-full  h-[44px] bg-main-blue rounded-full font-poppins cursor-pointer"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("logging_in")}
                        </>
                    ) : (
                        t("login")
                    )}
                </Button>
            </form>

            {/* <div className="relative my-5">
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
            </div> */}

            <div className="mt-6 text-center text-sm">
                {t("dont_have_account")}
                <Link href="/signup" className="font-medium text-teal-600 hover:underline">
                    {t("signup")}
                </Link>
            </div>

        </>
    )
}
