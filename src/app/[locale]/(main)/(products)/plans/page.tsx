"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { getStripePlans, StripePlan } from "@/lib/stripe-plans"; // adjust path if needed
import { Loader } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
;

export default function PlansPage() {
    const locale = useLocale()
    const t = useTranslations("PlansPage")

    const planKeys: StripePlan[] = ["basic", "pro", "enterprise"];
    const [loadingPlan, setLoadingPlan] = useState<StripePlan | null>(null);
    const plans = getStripePlans(locale);
    const router = useRouter()
    const { data: session } = useSession();
    return (
        <div className="min-h-screen bg-[white] flex flex-col">
            {/* Header */}
            <header className="w-full max-w-4xl mx-auto text-center pt-40 pb-12 px-4">
                <h1 className="text-5xl md:text-6xl font-bold font-inter tracking-tight text-[#1B4048]">
                    {t("header.title")}
                </h1>
                <p className="mt-6 text-lg md:text-xl text-[#1B4048] max-w-2xl mx-auto">
                    {t("header.description")}
                </p>
            </header>

            {/* Plans Grid */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-20">
                <div className="grid gap-8 md:grid-cols-3">
                    {planKeys.map((key) => {
                        const plan = plans[key];
                        const isHighlighted = key === "pro";
                        return (
                            <Card
                                key={plan.name}
                                className={`flex flex-col bg-[#EBE3CC] overflow-hidden relative rounded-2xl border transition ${isHighlighted
                                    ? "border-[#2ECC71] shadow-2xl scale-105"
                                    : "border-gray-200 shadow-md"
                                    } hover:shadow-xl`}
                            >
                                {session?.user && (
                                    <>
                                        {key === session?.user.subscription_plan && (
                                            <div className="absolute top-0 right-0 bg-green-500 text-white text-base font-semibold px-4 py-2 rounded-bl-lg shadow-md">
                                                {{
                                                    en: 'Current Plan',
                                                    de: 'Aktueller Plan',
                                                    es: 'Plan actual',
                                                    fr: 'Forfait actuel',
                                                    nl: 'Huidig plan',
                                                    it: 'Piano attuale'
                                                }[locale] || 'Current Plan'}
                                            </div>
                                        )}
                                    </>
                                )}

                                <CardHeader>
                                    {isHighlighted && (
                                        <p className="text-sm font-semibold text-[#002147] uppercase tracking-wide">
                                            {locale === "de"
                                                ? "Am beliebtesten"
                                                : locale === "es"
                                                    ? "Más popular"
                                                    : locale === "fr"
                                                        ? "Le plus populaire"
                                                        : locale === "it"
                                                            ? "Il più popolare"
                                                            : locale === "nl"
                                                                ? "Meest populair"
                                                                : "Most Popular"}
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
                                        onClick={() => {
                                            setLoadingPlan(key);

                                            localStorage.setItem("comingFrom", "plans");

                                            if (!session?.user) {
                                                router.push("/sign-up");
                                            } else {
                                                router.push("/dashboard");
                                            }
                                        }}

                                        disabled={loadingPlan === key}
                                        className={`w-full h-[52px] rounded-full font-poppins cursor-pointer font-semibold ${isHighlighted
                                            ? "bg-[#009A5E] hover:bg-[#009A5E]/80 text-white"
                                            : "bg-gray-100 hover:bg-gray-200 text-[#002147]"
                                            }`}
                                    >
                                        {
                                            loadingPlan === key ? (
                                                <Loader className="h-5 w-5 animate-spin" />
                                            ) :
                                                <>
                                                    {plan.price === 0 ? (
                                                        locale === "de"
                                                            ? "Kostenlos starten"
                                                            : locale === "es"
                                                                ? "Comenzar gratis"
                                                                : locale === "fr"
                                                                    ? "Commencer gratuitement"
                                                                    : locale === "it"
                                                                        ? "Inizia gratis"
                                                                        : locale === "nl"
                                                                            ? "Gratis starten"
                                                                            : "Start Free"
                                                    ) : (
                                                        locale === "de"
                                                            ? "Plan wählen"
                                                            : locale === "es"
                                                                ? "Elegir plan"
                                                                : locale === "fr"
                                                                    ? "Choisir le plan"
                                                                    : locale === "it"
                                                                        ? "Scegli piano"
                                                                        : locale === "nl"
                                                                            ? "Kies plan"
                                                                            : "Choose Plan"
                                                    )}
                                                </>
                                        }

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
                    {t("footer.question")}{" "}
                    <Link
                        href="/contact"
                        className="text-[#002147] font-medium hover:underline"
                    >
                        {t("footer.action")}
                    </Link>
                </p>
            </footer>
        </div>
    );
}
