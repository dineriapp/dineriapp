"use client";

import {
    BarChart3,
    CalendarDays,
    Globe,
    Menu,
    Share2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Page() {
    const why = [
        {
            icon: Globe,
            title: "Centralized Management",
            description:
                "Manage menus, orders, events, and promotions all in one place.",
        },
        {
            icon: Menu,
            title: "Seamless Guest Experience",
            description:
                "Give your customers a modern and smooth way to interact with your business.",
        },
        {
            icon: CalendarDays,
            title: "Actionable Insights",
            description:
                "Analytics that show you what’s working and where you can improve.",
        },
        {
            icon: BarChart3,
            title: "Scalable & Flexible",
            description:
                "Start small and grow with advanced features as your needs expand.",
        },
        {
            icon: Share2,
            title: "Easy to Use",
            description:
                "No technical background required – designed for everyone.",
        },
    ];

    return (
        <div id="why-use-this-platform" className="px-6 scroll-mt-26 py-8 md:py-16 w-full flex justify-center">
            <div className="max-w-5xl w-full">
                {/* Intro Header */}
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-main-blue">
                    Introduction
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                    Welcome to the platform! This guide will help you get started quickly
                    and understand the essentials. Whether you are a restaurant owner,
                    manager, or part of a hospitality team, our platform is built to make
                    your day-to-day operations easier and more efficient.
                </p>
                <p className="text-lg text-muted-foreground mb-12">
                    We combine simplicity, flexibility, and powerful features so you can
                    focus on running your business while we handle the technical side.
                </p>

                <Separator className="my-12" />

                {/* Why use this platform */}
                <section >
                    <h2 className="text-3xl font-bold  mb-10">
                        Why use this platform?
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
                        Who is it for?
                    </h2>
                    <div className="space-y-6 text-slate-700">
                        <p>
                            <span className="font-semibold ">
                                Restaurants & Cafés:
                            </span>{" "}
                            Simplify reservations, orders, and menu management.
                        </p>
                        <p>
                            <span className="font-semibold ">
                                Bars & Lounges:
                            </span>{" "}
                            Promote events and engage customers with QR codes and popups.
                        </p>
                        <p>
                            <span className="font-semibold ">
                                Hospitality Businesses:
                            </span>{" "}
                            Gain insights through analytics and streamline operations.
                        </p>
                        <p>
                            <span className="font-semibold ">
                                Private Chefs & Catering Services:
                            </span>{" "}
                            Showcase menus, manage bookings, and provide clients with a
                            personalized experience.
                        </p>
                        <p>
                            <span className="font-semibold ">
                                Food Trucks & Pop-ups:
                            </span>{" "}
                            Share your location, menu, and updates instantly.
                        </p>
                    </div>
                </section>

                <Separator className="my-16" />

                {/* Key Points */}
                <section id="key-Points-to-remember" className="scroll-mt-26">
                    <h2 className="text-3xl font-bold mb-10">
                        Key Points to Remember
                    </h2>
                    <ul className="space-y-4">
                        {[
                            "One central dashboard – Everything you need (menus, orders, analytics, events) is managed from one place.",
                            "Quick setup – You can be up and running in just a few minutes.",
                            "No technical skills required – The editor is designed to be simple and intuitive.",
                            "Flexible features – Turn modules (e.g. events, popups, QR codes) on or off as needed.",
                            "Mobile-friendly – Works seamlessly on any device for both you and your guests.",
                            "Customizable design – Adapt the look and feel to match your brand identity.",
                            "Real-time updates – Any changes you make are reflected instantly.",
                            "Secure & reliable – Your data and customer information are protected.",
                            "Scalable – Start small and expand as your business grows.",
                            "Continuous improvements – Regular updates bring new features and enhancements.",
                        ].map((point, i) => (
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
