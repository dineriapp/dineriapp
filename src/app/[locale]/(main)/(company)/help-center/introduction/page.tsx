"use client";

import {
    BarChart3,
    CalendarDays,
    Globe,
    Menu,
    Share2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export default function IntroductionPage() {
    const t = useTranslations("HelpCenter.Introduction");

    const why = [
        {
            icon: Globe,
            title: t("why.centralizedManagement.title"),
            description: t("why.centralizedManagement.description"),
        },
        {
            icon: Menu,
            title: t("why.seamlessExperience.title"),
            description: t("why.seamlessExperience.description"),
        },
        {
            icon: CalendarDays,
            title: t("why.insights.title"),
            description: t("why.insights.description"),
        },
        {
            icon: BarChart3,
            title: t("why.scalable.title"),
            description: t("why.scalable.description"),
        },
        {
            icon: Share2,
            title: t("why.easyToUse.title"),
            description: t("why.easyToUse.description"),
        },
    ];

    return (
        <div id="why-use-this-platform" className="px-6 scroll-mt-26 py-8 md:py-16 w-full flex justify-center">
            <div className="max-w-5xl w-full">
                {/* Intro Header */}
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-main-blue">
                    {t("pageTitle")}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                    {t("welcome")}
                </p>
                <p className="text-lg text-muted-foreground mb-12">
                    {t("welcome2")}
                </p>

                <Separator className="my-12" />

                {/* Why use this platform */}
                <section >
                    <h2 className="text-3xl font-bold  mb-10">
                        {t("whyTitle")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {why.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all bg-white"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center bg-indigo-50 text-main-green">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1 text-slate-900">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <Separator className="my-16" />

                {/* Who is it for */}
                <section id="who-is-it-for" className="scroll-mt-26">
                    <h2 className="text-3xl font-bold  mb-10">
                        {t("whoTitle")}
                    </h2>
                    <div className="space-y-6 text-slate-700">
                        <p>
                            <span className="font-semibold ">
                                {t("who.restaurants.title")}
                            </span>{" "}
                            {t("who.restaurants.description")}
                        </p>
                        <p>
                            <span className="font-semibold ">
                                {t("who.bars.title")}
                            </span>{" "}
                            {t("who.bars.description")}
                        </p>
                        <p>
                            <span className="font-semibold ">
                                {t("who.hospitality.title")}
                            </span>{" "}
                            {t("who.hospitality.description")}
                        </p>
                        <p>
                            <span className="font-semibold ">
                                {t("who.chefs.title")}
                            </span>{" "}
                            {t("who.chefs.description")}
                        </p>
                        <p>
                            <span className="font-semibold ">
                                {t("who.foodTrucks.title")}
                            </span>{" "}
                            {t("who.foodTrucks.description")}
                        </p>
                    </div>
                </section>

                <Separator className="my-16" />

                {/* Key Points */}
                <section id="key-Points-to-remember" className="scroll-mt-26">
                    <h2 className="text-3xl font-bold mb-10">
                        {t("keyPointsTitle")}
                    </h2>
                    <ul className="space-y-4">
                        {t.raw("keyPoints")?.map((point: string, i: number) => (
                            <li
                                key={i}
                                className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <p className="text-slate-700"><span className="text-black font-semibold">{point.split("–")[0]}</span>-{point.split("–")[1]}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
