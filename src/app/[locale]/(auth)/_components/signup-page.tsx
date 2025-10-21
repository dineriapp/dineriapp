"use client"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signup } from "@/actions/auth"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"




export default function SignupPage() {
    const router = useRouter()
    const t = useTranslations("signup_page")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const SignupSchema = z.object({
        email: z.string().email({ message: t("invalid_email") }),
        password: z.string().min(8, { message: t("password_min_length") }),
        confirmPassword: z.string().min(8, { message: t("confirm_password_min_length") }),
        agree: z.boolean().refine((val) => val === true, {
            message: t("agree_required"),
        }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("passwords_do_not_match"),
        path: ["confirmPassword"],
    });

    type SignupFormData = z.infer<typeof SignupSchema>

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
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {t("create_account")}
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
                    <Label htmlFor="password">
                        {t("password_label")}
                    </Label>
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

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                        {t("confirm_password_label")}
                    </Label>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder={t("confirm_password_placeholder")}
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
                        {t("agree_text")}
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("creating_account")}
                        </>
                    ) : (
                        t("continue")
                    )}
                </Button>
            </form>


            <div className="mt-6 text-center text-sm">
                {t("already_have_account")}
                <Link href="/login" className="font-medium text-teal-600 hover:underline">
                    {t("login")}
                </Link>
            </div>
        </>
    )
}
