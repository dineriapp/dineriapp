"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, Loader2 } from "lucide-react"

export function NewsletterForm() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setStatus("loading")

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Success case
            setStatus("success")
            setEmail("")

            // Reset after 5 seconds
            setTimeout(() => {
                setStatus("idle")
            }, 5000)
        } catch {
            setStatus("error")
            setErrorMessage("Something went wrong. Please try again.")

            // Reset error after 5 seconds
            setTimeout(() => {
                setStatus("idle")
                setErrorMessage("")
            }, 5000)
        }
    }

    return (
        <div>
            {status === "success" ? (
                <div className="flex items-center gap-3 rounded-lg bg-main-action/20 p-4 text-main-action">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-main-action/30">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">Thank you for subscribing!</p>
                        <p className="text-sm text-main-action/80">We&apos;ll keep you updated with the latest news.</p>
                    </div>
                </div>
            ) : status === "error" ? (
                <div className="flex items-center gap-3 rounded-lg bg-main-warning/20 p-4 text-main-warning">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-main-warning/30">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">Subscription failed</p>
                        <p className="text-sm text-main-warning/80">{errorMessage}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative">
                    <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 rounded-lg border-[#334155] bg-[#334155]/50 pl-4 pr-12 text-white placeholder:text-[#94a3b8] focus:border-main-action focus:ring-main-action/20"
                        disabled={status === "loading"}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={status === "loading"}
                        className="absolute right-2 top-2 h-10 w-10 rounded-md bg-gradient-to-r from-main-action to-main hover:from-[#29b765] hover:to-[#001e3a]"
                    >
                        {status === "loading" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <ArrowRight className="h-5 w-5" />
                        )}
                    </Button>
                </form>
            )}
        </div>
    )
}
