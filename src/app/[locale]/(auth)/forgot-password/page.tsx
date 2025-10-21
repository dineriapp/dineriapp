"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useTranslations } from "next-intl"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const t = useTranslations("forgot_password_page")
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))
            setIsSubmitted(true)
        } catch {
            setError(t("error_generic"))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="mb-4 mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t("title")}
                </h1>
                <p className="mt-2 text-slate-600">
                    {t("description")}
                </p>
            </div>
            {isSubmitted ? (
                <div className="rounded-lg bg-teal-50 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                        <CheckCircle className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-teal-800">
                        {t("success_title")}
                    </h3>
                    <p className="mb-6 text-teal-700">
                        {t("success_message", { email })}
                    </p>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            {t("resend_instruction")}
                            <button onClick={() => setIsSubmitted(false)} className="font-medium text-teal-600 hover:underline">
                                {t("resend_button")}
                            </button>
                        </p>
                        <Link href="/auth/login">
                            <Button
                                variant="outline"
                                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                            >
                                {t("back_to_login_button")}
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                {t("email_label")}
                            </Label>
                            <div className="relative flex items-center justify-center">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("email_placeholder")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-[44px]"
                                    required
                                    disabled={isLoading}
                                />
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full  h-[44px] bg-main-blue rounded-full font-poppins cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("sending_reset_link")}
                                </>
                            ) : (
                                t("send_reset_link")
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        {t("remember_password")}
                        <Link href="/login" className="font-medium text-teal-600 hover:underline">
                            {t("back_to_login_link")}
                        </Link>
                    </div>
                </>
            )}
        </>
    )
}
