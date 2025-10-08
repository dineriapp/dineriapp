"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { supabase } from "@/supabase/clients/client"
import { useTranslations } from "next-intl"

interface EmailChangeRequest {
    newEmail: string
    password: string
}

export default function EmailChangePage() {
    const router = useRouter()
    const [newEmail, setNewEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmationSent, setConfirmationSent] = useState(false)
    const t = useTranslations("EmailChangePage")
    // Get current user
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ["current-user"],
        queryFn: async () => {
            const { data, error } = await supabase.auth.getUser()
            if (error) throw error
            return data.user
        },
    })

    // Email change mutation
    const emailChangeMutation = useMutation({
        mutationFn: async ({ newEmail, password }: EmailChangeRequest) => {

            // First verify the current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: password,
            })

            if (signInError) {
                throw new Error(t("toastPasswordIncorrect"))
            }

            // Request email change
            const { error } = await supabase.auth.updateUser({
                email: newEmail,
            })

            if (error) {
                throw error
            }

            return { success: true }
        },
        onSuccess: () => {
            setConfirmationSent(true)
            toast.success(t("toastConfirmationSent"))
        },
        onError: (error: any) => {
            toast.error(error.message || t("toastFailed"))
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!newEmail || !password) {
            toast.error(t("toastFillAll"))
            return
        }

        if (newEmail === user?.email) {
            toast.error(t("toastDifferentEmail"))
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail)) {
            toast.error(t("toastInvalidEmail"))
            return
        }

        emailChangeMutation.mutate({ newEmail, password })
    }


    if (userLoading) {
        return (
            <div className="container max-w-2xl mx-auto py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    if (!user) {
        router.push("/login")
        return null
    }

    if (confirmationSent) {
        return (
            <div className="container max-w-2xl mx-auto py-8">
                <div className="mb-6">
                    <Link
                        href="/dashboard/settings"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("backToSettings")}
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle>
                            {t("confirmationEmailsSentTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("confirmationEmailsSentDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Mail className="h-4 w-4" />
                            <AlertDescription>
                                <strong>
                                    {t("currentEmail")}</strong> {user.email}
                                <br />
                                <strong>{t("newEmail")}</strong> {newEmail}
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            {t.raw("confirmationSteps")?.map((Item: string, index: number) => (
                                <div key={index} className="flex items-start space-x-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                                        {index + 1}
                                    </div>
                                    <p>
                                        {Item}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>{t("importantNote")}</strong> {t("importantDesc")}
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-center pt-4">
                            <Button variant="outline" onClick={() => setConfirmationSent(false)}>
                                {t("changeDifferentEmail")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <div className="mb-4">
                <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("backToSettings")}
                </Link>

            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Mail className="mr-2 h-5 w-5" />
                        {t("changeEmailTitle")}
                    </CardTitle>
                    <CardDescription>
                        {t("changeEmailDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current-email">
                                {t("currentEmail")}
                            </Label>
                            <Input id="current-email" type="email" value={user.email || ""} disabled className="bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-email">
                                {t("newEmailLabel")}
                            </Label>
                            <Input
                                id="new-email"
                                type="email"
                                placeholder={t("newEmailPlaceholder")}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {t("passwordLabel")}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t("passwordPlaceholder")}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">{t("passwordHelp")}</p>
                        </div>

                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                <strong>{t("securityNoticeTitle")}</strong> {t("securityNoticeDesc")}
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-end space-x-3">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={emailChangeMutation.isPending}>
                                {emailChangeMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("sendingConfirmation")}
                                    </>
                                ) : (
                                    <>
                                        {t("changeEmailBtn")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-sm">
                        {t("howItWorksTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    {
                        t.raw("howItWorksSteps")?.map((item: string, index: number) => (
                            <div key={`ss-${index}`} className="flex items-start space-x-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                                    {index + 1}
                                </div>
                                <p>{item}</p>
                            </div>
                        ))
                    }
                </CardContent>
            </Card>
        </div>
    )
}
