"use client"
import { Button } from '@/components/ui/button'
import { useAuthCheck } from '@/hooks/use-auth-check'
import { STRIPE_PLANS, type StripePlan } from "@/lib/stripe-plans"
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'


const PricingSection = () => {
    const [loading, setLoading] = useState<StripePlan | null>(null)
    const router = useRouter()
    const isAuthenticated = useAuthCheck()

    const handleSubscribe = async (plan: StripePlan) => {

        if (!isAuthenticated) {
            router.push("/login")
            return
        }

        if (plan === "basic") {
            router.push("/dashboard")
            return
        }

        setLoading(plan)
        try {
            const response = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ plan }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session")
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url
        } catch (error) {
            console.error("Subscription error:", error)
            toast("Error", {
                description: error instanceof Error ? error.message : "Failed to start subscription process",
            })
        } finally {
            setLoading(null)
        }
    }

    return (
        <section id="pricing" className="bg-main-background py-14 lg:py-24">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="mb-10 lg:mb-16 max-w-3xl mx-auto text-center">
                    <h2 className="mb-4 text-3xl font-bold text-main md:text-4xl lg:text-5xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-lg text-main-text">
                        No hidden fees. No surprises - Select the plan that suits you best
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {Object.entries(STRIPE_PLANS).map(([key, plan]) => {
                        const planKey = key as StripePlan
                        const isPopular = planKey === "pro"
                        const isLoading = loading === planKey

                        return (
                            <div
                                key={planKey}
                                className={`relative rounded-xl p-7 transition-all duration-200 ${isPopular
                                    ? "bg-gradient-to-r from-main-action to-main text-white shadow-main/10 transform hover:-translate-y-1 shadow-lg scale-105"
                                    : "bg-white border border-main-background hover:border-[#e2e8f0] hover:shadow-md"
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-main-action px-3 py-1 text-xs font-medium text-white">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="text-2xl font-bold">{plan.name}</h3>

                                <div className="my-4">
                                    <span className="text-4xl font-bold">{plan.price}$</span>
                                    <span className={`text-sm ${isPopular ? "text-white/80" : "text-main-text"}`}>
                                        /month
                                    </span>
                                </div>

                                <p className={`mb-6 ${isPopular ? "text-white/90" : "text-main-text"}`}>
                                    {plan.description}
                                </p>

                                <ul className="mb-8 space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className={`h-5 w-5 ${isPopular ? "text-white" : "text-main-action"}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => handleSubscribe(planKey)}
                                    disabled={isLoading}
                                    variant={isPopular ? "default" : "outline"}
                                    className={`w-full h-[44px] cursor-pointer ${isPopular
                                        ? "bg-white text-main hover:bg-main-background"
                                        : "bg-gradient-to-r hover:text-white from-main-action to-main text-white hover:from-[#29b765] hover:to-[#001e3a]"
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>{planKey === "basic" ? "Get Started Free" : `Subscribe to ${plan.name}`}</>
                                    )}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default PricingSection
