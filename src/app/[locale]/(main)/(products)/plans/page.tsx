"use client";

import { STRIPE_PLANS, StripePlan } from "@/lib/stripe-plans"; // adjust path if needed
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlansPage() {
    const planKeys: StripePlan[] = ["basic", "pro", "enterprise"];

    return (
        <div className="min-h-screen bg-[white] flex flex-col">
            {/* Header */}
            <header className="w-full max-w-4xl mx-auto text-center pt-40 pb-12 px-4">
                <h1 className="text-5xl md:text-6xl font-bold font-inter tracking-tight text-[#1B4048]">
                    Choose the right plan for your restaurant
                </h1>
                <p className="mt-6 text-lg md:text-xl text-[#1B4048] max-w-2xl mx-auto">
                    Start free and upgrade as your restaurant grows. All plans come with
                    powerful tools to showcase your menu, events, and brand online.
                </p>
            </header>

            {/* Plans Grid */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-20">
                <div className="grid gap-8 md:grid-cols-3">
                    {planKeys.map((key) => {
                        const plan = STRIPE_PLANS[key];
                        const isHighlighted = key === "pro"; // Highlight Pro as "Most popular"

                        return (
                            <Card
                                key={plan.name}
                                className={`flex flex-col bg-[#EBE3CC] rounded-2xl border transition ${isHighlighted
                                    ? "border-[#2ECC71] shadow-2xl scale-105"
                                    : "border-gray-200 shadow-md"
                                    } hover:shadow-xl`}
                            >
                                <CardHeader>
                                    {isHighlighted && (
                                        <p className="text-sm font-semibold text-[#002147] uppercase tracking-wide">
                                            Most Popular
                                        </p>
                                    )}
                                    <CardTitle className="text-3xl font-bold mt-2">
                                        {plan.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-gray-600">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <p className="text-4xl font-extrabold text-[#002147] mb-6">
                                        {plan.price === 0 ? "Free" : `$${plan.price}/month`}
                                    </p>
                                    <ul className="space-y-3 text-gray-700">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <span className="text-[#2ECC71]">✔</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        className={`w-full h-[52px] rounded-full font-poppins cursor-pointer font-semibold ${isHighlighted
                                            ? "bg-[#009A5E] hover:bg-[#009A5E]/80 text-white"
                                            : "bg-gray-100 hover:bg-gray-200 text-[#002147]"
                                            }`}
                                    >
                                        {plan.price === 0 ? "Start Free" : "Choose Plan"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full text-center py-8 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                    Need something custom?{" "}
                    <Link
                        href="/contact"
                        className="text-[#002147] font-medium hover:underline"
                    >
                        Contact our team
                    </Link>
                </p>
            </footer>
        </div>
    );
}
