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
                <div className="flex items-center gap-3 rounded-lg bg-teal-500/20 p-4 text-teal-300">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/30">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">Thank you for subscribing!</p>
                        <p className="text-sm text-teal-300/80">We&apos;ll keep you updated with the latest news.</p>
                    </div>
                </div>
            ) : status === "error" ? (
                <div className="flex items-center gap-3 rounded-lg bg-red-500/20 p-4 text-red-300">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/30">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">Subscription failed</p>
                        <p className="text-sm text-red-300/80">{errorMessage}</p>
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
                        className="h-14 rounded-lg border-slate-700 bg-slate-700/50 pl-4 pr-12 text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                        disabled={status === "loading"}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={status === "loading"}
                        className="absolute right-2 top-2 h-10 w-10 rounded-md bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                    >
                        {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                    </Button>
                </form>
            )}
        </div>
    )
}
