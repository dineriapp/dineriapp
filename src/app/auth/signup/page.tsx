"use client"

import type React from "react"

import { SocialButton } from "@/components/social-button"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        agreeTerms: false,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, agreeTerms: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.agreeTerms) {
            setError("You must agree to the terms and conditions")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            // Simulate registration delay
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // For demo purposes, just redirect to home
            // In a real app, you would register with your backend
            router.push("/dashboard")
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <
            >
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
                <p className="mt-2 text-slate-600">Sign up for dineri.app to start building your restaurant&apos;s online presence.</p>
            </div>
            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@restaurant.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10 h-[44px]"
                            required
                            disabled={isLoading}
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative flex items-center justify-center">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10 h-[44px]"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500">Password must be at least 8 characters</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={handleCheckboxChange}
                        disabled={isLoading}
                    />
                    <Label htmlFor="agreeTerms" className="text-xs font-normal">
                        I agree to the{" "}
                        <Link href="/terms" className="text-teal-600 hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-teal-600 hover:underline">
                            Privacy Policy
                        </Link>
                    </Label>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r h-[44px] from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                    disabled={isLoading || !formData.agreeTerms}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                        </>
                    ) : (
                        "Create account"
                    )}
                </Button>
            </form>

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

            <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-teal-600 hover:underline">
                    Log in
                </Link>
            </div>
        </>
    )
}
