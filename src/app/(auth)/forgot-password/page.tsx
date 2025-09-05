"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))
            setIsSubmitted(true)
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="mb-4 mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reset your password</h1>
                <p className="mt-2 text-slate-600">Enter your email address and we&apos;ll send you a link to reset your password.</p>
            </div>
            {isSubmitted ? (
                <div className="rounded-lg bg-teal-50 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                        <CheckCircle className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-teal-800">Check your email</h3>
                    <p className="mb-6 text-teal-700">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>
                    </p>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Didn&apos;t receive the email? Check your spam folder or{" "}
                            <button onClick={() => setIsSubmitted(false)} className="font-medium text-teal-600 hover:underline">
                                try again
                            </button>
                        </p>
                        <Link href="/auth/login">
                            <Button
                                variant="outline"
                                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                            >
                                Back to login
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
                            <Label htmlFor="email">Email</Label>
                            <div className="relative flex items-center justify-center">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@restaurant.com"
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending reset link...
                                </>
                            ) : (
                                "Send reset link"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        Remember your password?{" "}
                        <Link href="/auth/login" className="font-medium text-teal-600 hover:underline">
                            Back to login
                        </Link>
                    </div>
                </>
            )}
        </>
    )
}
