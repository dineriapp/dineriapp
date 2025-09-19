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

interface EmailChangeRequest {
    newEmail: string
    password: string
}

export default function EmailChangePage() {
    const router = useRouter()
    const [newEmail, setNewEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmationSent, setConfirmationSent] = useState(false)

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
                throw new Error("Current password is incorrect")
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
            toast.success("Confirmation emails sent! Please check both your current and new email addresses.")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to change email")
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!newEmail || !password) {
            toast.error("Please fill in all fields")
            return
        }

        if (newEmail === user?.email) {
            toast.error("New email must be different from current email")
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail)) {
            toast.error("Please enter a valid email address")
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
                        Back to Settings
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle>Confirmation Emails Sent</CardTitle>
                        <CardDescription>
                            We&apos;ve sent confirmation emails to both your current and new email addresses
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Mail className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Current Email:</strong> {user.email}
                                <br />
                                <strong>New Email:</strong> {newEmail}
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-start space-x-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                                    1
                                </div>
                                <p>
                                    Check your <strong>current email</strong> ({user.email}) and click the confirmation link
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                                    2
                                </div>
                                <p>
                                    Check your <strong>new email</strong> ({newEmail}) and click the confirmation link
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                                    3
                                </div>
                                <p>Your email will be updated once both confirmations are complete</p>
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Important:</strong> You must confirm from both email addresses. If you don&apos;t receive the emails
                                within a few minutes, check your spam folder.
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-center pt-4">
                            <Button variant="outline" onClick={() => setConfirmationSent(false)}>
                                Change Different Email
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
                    Back to Settings
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Mail className="mr-2 h-5 w-5" />
                        Change Email Address
                    </CardTitle>
                    <CardDescription>
                        Update your account email address. You&apos;ll need to confirm the change from both your current and new email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current-email">Current Email</Label>
                            <Input id="current-email" type="email" value={user.email || ""} disabled className="bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-email">New Email Address</Label>
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="Enter your new email address"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Current Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your current password to confirm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">We need your current password to verify your identity</p>
                        </div>

                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Security Notice:</strong> After submitting, you&apos;ll receive confirmation emails at both your
                                current and new email addresses. You must click the confirmation links in both emails to complete the
                                change.
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-end space-x-3">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={emailChangeMutation.isPending}>
                                {emailChangeMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Confirmation...
                                    </>
                                ) : (
                                    "Change Email"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-sm">How Email Change Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                            1
                        </div>
                        <p>Enter your new email address and current password</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                            2
                        </div>
                        <p>Confirmation emails are sent to both your current and new email addresses</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                            3
                        </div>
                        <p>Click the confirmation link in your current email to verify it&apos;s really you</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                            4
                        </div>
                        <p>Click the confirmation link in your new email to activate it</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                            5
                        </div>
                        <p>Your email address is updated and you can log in with the new email</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
