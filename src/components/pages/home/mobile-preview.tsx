import { Calendar, Instagram, MapPin, Utensils } from "lucide-react"

export function MobilePreview() {
    return (
        <div className="relative w-[300px]">
            {/* Phone frame with shadow effects */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-teal-600/20 to-blue-600/20 transform rotate-3 blur-sm"></div>
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-teal-600/10 to-blue-600/10 transform -rotate-2 blur-sm"></div>

            {/* Phone body */}
            <div className="relative rounded-[2.5rem] bg-slate-800 p-2 shadow-2xl">
                {/* Screen */}
                <div className="overflow-hidden rounded-[2rem] bg-white">
                    {/* Profile header */}
                    <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4 text-white">
                        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-white/80 bg-white">
                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-800">TM</div>
                        </div>
                        <h2 className="text-center text-xl font-bold">Trattoria Milano</h2>
                        <p className="text-center text-sm text-white/90">Authentic Italian cuisine in the heart of the city</p>
                    </div>

                    {/* Profile content */}
                    <div className="space-y-2 px-4 py-2">
                        {[
                            { label: "Make a reservation", icon: Calendar },
                            { label: "View our menu", icon: Utensils },
                            { label: "Get directions", icon: MapPin },
                            { label: "Follow us on Instagram", icon: Instagram },
                        ].map((link, i) => {
                            const Icon = link.icon
                            return (
                                <button
                                    key={i}
                                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-2 text-left text-sm font-medium text-slate-800 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-blue-100">
                                        <Icon className="h-4 w-4 text-slate-700" />
                                    </div>
                                    <span>{link.label}</span>
                                </button>
                            )
                        })}

                        {/* Gallery preview */}
                        <div className="mt-2">
                            <h3 className="mb-2 text-sm font-medium text-slate-500">Gallery</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="aspect-square rounded-lg bg-slate-100"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
