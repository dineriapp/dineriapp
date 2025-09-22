"use client";

import { Separator } from "@/components/ui/separator";
import {
    Clock,
    Wrench
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function WhatIsNew() {
    const t = useTranslations("HelpCenter.WhatIsNew");

    return (
        <div id="new-features" className="px-6 scroll-mt-26 py-8 md:py-16 w-full flex justify-center">
            <div className="max-w-5xl w-full">
                {/* Intro Header */}
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-main-blue">
                    {t("pageTitle")}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                    {t("intro")}
                </p>

                <Separator className="my-12" />

                {/* September Updates */}
                <section >
                    <h2 className="text-3xl font-bold  mb-6">
                        {t("septemberTitle")}
                    </h2>

                    <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800">
                        {t("newFeaturesTitle")}
                    </h3>
                    <ul className="space-y-4 mb-10">
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">{t("newFeatures.menuEditor.title")} {"–"}{" "}</span>
                                {t("newFeatures.menuEditor.description")}
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">{t("newFeatures.qrCodes.title")} {"–"}{" "}</span>
                                {t("newFeatures.qrCodes.description")}
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">{t("newFeatures.popups.title")} {"–"}{" "}</span>
                                {t("newFeatures.popups.description")}
                            </p>
                        </li>
                    </ul>
                </section>

                <Separator className="my-16" />

                {/* October Updates */}
                <section id="improvements" className="scroll-mt-26">
                    <h2 className="text-3xl font-bold text-green-700 mb-6">
                        {t("octoberTitle")}
                    </h2>

                    <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800">
                        <Wrench className="h-5 w-5 text-green-600" />
                        {t("improvementsTitle")}
                    </h3>
                    <ul className="space-y-4 mb-10">
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">{t("improvements.typography.title")} {"–"}{" "}</span>
                                {t("improvements.typography.description")}
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">{t("improvements.dashboard.title")} {"–"}{" "}</span>
                                {t("improvements.dashboard.description")}
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">{t("improvements.bugFixes.title")} {"–"}{" "}</span>
                                {t("improvements.bugFixes.description")}
                            </p>
                        </li>
                    </ul>
                </section>

                <Separator className="my-16" />

                <section id="coming-soon" className="scroll-mt-26">
                    <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800">
                        <Clock className="h-5 w-5 text-amber-600" />
                        {t("comingSoonTitle")}
                    </h3>
                    <ul className="space-y-4">
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">
                                    {t("comingSoon.loyaltyTools.title")} {"–"}{" "}
                                </span>
                                {t("comingSoon.loyaltyTools.description")}
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">
                                    {t("comingSoon.reservationIntegration.title")} {"–"}{" "}
                                </span>
                                {t("comingSoon.reservationIntegration.description")}
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">
                                    {t("comingSoon.advancedAnalytics.title")} {"–"}{" "}
                                </span>
                                {t("comingSoon.advancedAnalytics.description")}
                            </p>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
