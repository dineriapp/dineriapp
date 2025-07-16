import { Calendar, Facebook, Instagram, Mail, MapPin, MessageCircle, Utensils } from "lucide-react"
import Link from "next/link";
import { memo } from "react"

export function MobilePreview() {


    const SocialIcons = memo(() => {
        return (
            <div className="flex flex-wrap items-center justify-center gap-3">
                {[Instagram, Facebook, MessageCircle, Mail, MapPin].map((Icon, idx) => (
                    <div key={idx} className="hover:scale-[1.1] cursor-pointer text-[#0db6ac]">
                        <Icon className="h-6 w-6" />
                    </div>
                ))}
            </div>
        );
    });

    SocialIcons.displayName = "Social-Icons"

    return (
        <div className="relative w-[300px]">
            {/* Glow effects */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-[#0db6ac]/20 to-[#f4b400]/20 transform rotate-3 blur-sm"></div>
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-[#0db6ac]/10 to-[#f4b400]/10 transform -rotate-2 blur-sm"></div>

            {/* Phone body */}
            <div className="relative rounded-[2.5rem] bg-[#0f172a] p-2 shadow-2xl">
                {/* Screen */}
                <div className="overflow-hidden rounded-[2rem] bg-[#1e293b] min-h-[550px]">
                    {/* Profile header */}
                    <div className="px-6 py-4 text-white/80">
                        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-[#0db6ac] bg-gray-300">
                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-800">TM</div>
                        </div>
                        <h2 className="text-center text-xl font-bold text-white">Trattoria Milano</h2>
                        <p className="text-center text-sm text-white/70">Authentic Italian cuisine in the heart of the city</p>
                    </div>

                    <div className="py-4">
                        <SocialIcons />
                    </div>

                    {/* Profile content */}
                    <div className="space-y-2 px-4 py-2">
                        {[
                            { label: "Make a reservation", icon: Calendar },
                            { label: "View our menu", icon: Utensils },
                            { label: "Get directions", icon: MapPin },
                            { label: "Follow us on Instagram", icon: Instagram },
                        ].map((link, i) => {
                            const Icon = link.icon;
                            return (
                                <button
                                    key={i}
                                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-gradient-to-r from-[#f8fafc] to-[#e2e8f0] p-2 text-left text-sm font-medium text-slate-800 shadow-md transition-all hover:shadow-lg"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#0db6ac] to-[#0db6ac]">
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    <span>{link.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs mx-auto text-center mt-4 text-white">
                        Powered by{" "}
                        <Link href="/" className="underline text-[#0db6ac]" >
                            dineri.app
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
