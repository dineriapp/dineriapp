"use client";

import { Separator } from "@/components/ui/separator";
import {
    Clock,
    Wrench
} from "lucide-react";

export default function Page() {
    return (
        <div id="new-features" className="px-6 scroll-mt-26 py-8 md:py-16 w-full flex justify-center">
            <div className="max-w-5xl w-full">
                {/* Intro Header */}
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-main-blue">
                    What’s New?
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                    Stay up to date with the latest features and improvements. We’re continuously working to
                    make the platform more powerful, reliable, and easy to use.
                </p>

                <Separator className="my-12" />

                {/* September Updates */}
                <section >
                    <h2 className="text-3xl font-bold  mb-6">
                        September 2025 – Latest Updates
                    </h2>

                    <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800">
                        New Features
                    </h3>
                    <ul className="space-y-4 mb-10">
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">Menu Editor –</span> Easily
                                create and customize your menu with item descriptions and
                                pricing. Use it as a quick menu for instant sharing, or connect
                                it directly to your order system for a fully integrated
                                experience. You can switch between linked or standalone mode at
                                any time.
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">QR Codes –</span> Instantly
                                generate QR codes that connect your guests directly to your
                                menu, events, or promotions. Every scan is tracked, so you can
                                see exactly how often your QR codes are used and measure
                                engagement in real time.
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">Popups –</span> Create simple,
                                customizable popups to share announcements on your food ordering
                                page, highlight upcoming events, or simply welcome guests when
                                they visit.
                            </p>
                        </li>
                    </ul>
                </section>

                <Separator className="my-16" />

                {/* October Updates */}
                <section id="improvements" className="scroll-mt-26">
                    <h2 className="text-3xl font-bold text-green-700 mb-6">
                        October 2025 – Updates
                    </h2>

                    <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800">
                        <Wrench className="h-5 w-5 text-green-600" />
                        Improvements
                    </h3>
                    <ul className="space-y-4 mb-10">
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">More typography options –</span>{" "}
                                Expanded font choices for greater customization.
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">Dashboard design tweaks –</span>{" "}
                                Small adjustments for a cleaner, more user-friendly layout.
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">Bug fixes –</span> Minor issues
                                resolved for a smoother experience.
                            </p>
                        </li>
                    </ul>
                </section>

                <Separator className="my-16" />

                <section id="coming-soon" className="scroll-mt-26">
                    <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800">
                        <Clock className="h-5 w-5 text-amber-600" />
                        Coming Soon
                    </h3>
                    <ul className="space-y-4">
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">Loyalty Tools –</span> Reward
                                repeat guests with discounts and digital punch cards.
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">
                                    Reservation Tool Integration –
                                </span>{" "}
                                Connect Dineri.app with your existing booking system.
                            </p>
                        </li>
                        <li className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <p className="text-slate-700">
                                <span className="font-semibold">Advanced Analytics –</span>{" "}
                                Export reports and gain deeper insights into performance.
                            </p>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
