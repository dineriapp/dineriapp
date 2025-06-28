"use client"

import { signout } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User as prismaUserType } from "@/generated/prisma"
import kyInstance from "@/lib/ky"; // adjust the path as needed
import { useUserStore } from "@/stores/auth-store"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { GetRestaurantsResponse } from "@/types"
import {
    BarChart,
    Calendar,
    ChevronDown,
    Crown,
    Dot,
    Globe2,
    HelpCircle,
    Home,
    Layout,
    LinkIcon,
    LogOut,
    Palette,
    QrCode,
    Settings,
    User,
    Utensils,
    UtensilsCrossed
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"


const navigationGroups = [
    {
        label: "Overview",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: Home },
            { href: "/dashboard/stats", label: "Analytics", icon: BarChart },
        ],
    },
    {
        label: "Content",
        items: [
            { href: "/dashboard/links", label: "Links", icon: LinkIcon },
            { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
            { href: "/dashboard/events", label: "Events", icon: Calendar },
            { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
        ],
    },
    {
        label: "Marketing",
        items: [{ href: "/dashboard/qr-codes", label: "QR Codes", icon: QrCode }],
    },
    {
        label: "Customization",
        items: [
            { href: "/dashboard/templates", label: "Templates", icon: Layout },
            { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ],
    },
]


export function DashboardHeaderClientSide({ user, prismaUser }: { user: any, prismaUser: prismaUserType }) {
    const { restaurants, setRestaurants, selectedRestaurant, setSelectedRestaurant } = useRestaurantStore()
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
    const navRef = useRef<HTMLDivElement>(null)
    const { setSupabaseUser, setPrismaUser } = useUserStore()

    const router = useRouter()
    const pathname = usePathname()
    useEffect(() => {
        setExpandedGroup(null)
    }, [pathname])

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const result: GetRestaurantsResponse = await kyInstance.get("/api/restaurants/all").json<GetRestaurantsResponse>();

                if (result.restaurants) {
                    setRestaurants(result.restaurants);

                    const firstRestaurant = result.restaurants[0];
                    const restaurantID = localStorage.getItem("selected-restaurant-id");

                    if (!restaurantID) {
                        localStorage.setItem("selected-restaurant-id", firstRestaurant.id);
                        setSelectedRestaurant(firstRestaurant);
                    } else {
                        const restaurantSelected = result.restaurants.find(res => res.id === restaurantID);
                        if (restaurantSelected) {
                            setSelectedRestaurant(restaurantSelected);
                        } else {
                            setSelectedRestaurant(firstRestaurant);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            }
        };

        fetchRestaurants();
    }, []);

    // Hydrate store with server data
    useEffect(() => {
        setSupabaseUser(user)
        setPrismaUser(prismaUser)
    }, [user, prismaUser, setSupabaseUser, setPrismaUser])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setExpandedGroup(null)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSignOut = async () => {
        toast("Signed out successfully", {
            description: "You have been logged out of your account.",
        })
        await signout()
        router.push("/")
    }

    const toggleGroup = (label: string) => {
        setExpandedGroup(expandedGroup === label ? null : label)
    }

    const isPremium = prismaUser?.subscription_plan === "basic" ? false : true

    return (
        <header className="border-b border-slate-200 bg-white shadow-sm">
            <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard" className="flex items-center space-x-2 group">
                        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2 rounded-xl transition-transform group-hover:scale-110">
                            <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent inline-block">
                            dineri.app
                        </span>
                    </Link>

                    <nav ref={navRef} className="hidden lg:flex items-center space-x-1">
                        {navigationGroups.map((group) => (
                            <div key={group.label} className="relative group">
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium !h-[38px] transition-colors flex items-center gap-2 ${expandedGroup === group.label
                                        ? "bg-slate-100 text-teal-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                                        }`}
                                >
                                    {group.label}
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${expandedGroup === group.label ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {expandedGroup === group.label && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50">
                                        {group.items.map((item) => {
                                            const Icon = item.icon
                                            const isActive = pathname === item.href

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => {
                                                        setExpandedGroup(null)
                                                    }}
                                                    className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${isActive
                                                        ? "bg-gradient-to-r from-teal-50 to-blue-50 text-teal-600"
                                                        : "text-slate-700 hover:bg-slate-50 hover:text-teal-600"
                                                        }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    {restaurants.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-200 !h-[38px] text-slate-700 hover:bg-slate-50 hover:text-teal-600 flex items-center gap-2 px-3"
                                >
                                    <Utensils className="h-4 w-4" />
                                    {selectedRestaurant?.name}
                                    <ChevronDown className="h-4 w-4 ml-auto" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-1">
                                <div className="max-h-60 overflow-y-auto">
                                    <p className="text-xs px-2 py-1 text-slate-500 font-medium">Your Restaurants</p>
                                    {restaurants.map((rest) => (
                                        <DropdownMenuItem
                                            key={rest.id}
                                            onClick={() => setSelectedRestaurant(rest)}
                                            className="cursor-pointer flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-slate-100 text-slate-700 transition"
                                        >
                                            <Dot className="text-teal-600 h-4 w-4" />
                                            <p className="line-clamp-1"> {rest.name}</p>
                                        </DropdownMenuItem>
                                    ))}
                                </div>

                                <div className="border-t border-slate-200 mt-2 pt-2 px-3 pb-3">
                                    <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600">
                                        <p className="mb-1 font-medium text-slate-700">Need more?</p>
                                        <p>
                                            Multiple restaurant management is available in the{" "}
                                            <span className="text-teal-600 font-semibold">Enterprise Plan</span>.
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="mt-2 w-full text-sm bg-teal-600 hover:bg-teal-700 text-white"
                                        // onClick={() => router.push('/pricing')} // optional
                                        >
                                            Upgrade Plan
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {!isPremium && (
                        <Link href="/dashboard/upgrade">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-teal-600 !h-[38px] to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hidden sm:flex items-center gap-2 shadow-sm hover:shadow transition-all"
                            >
                                <Crown className="h-4 w-4" />
                                <span className="font-medium">Upgrade to Pro</span>
                            </Button>
                        </Link>
                    )}

                    {selectedRestaurant && (
                        <Link href={`/${selectedRestaurant.slug}`} target="_blank">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex items-center gap-2 !h-[38px] text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                            >
                                <Globe2 className="h-4 w-4" />
                                <span>Visit Site</span>
                            </Button>
                        </Link>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-9 w-9 border border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r shrink-0 from-teal-600 to-blue-600 flex items-center justify-center text-white">
                                    {user?.email?.charAt(0) || "U"}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-xs font-medium truncate max-w-[160px]">
                                        {user?.email || "User"}
                                    </p>
                                    <span className="text-xs text-slate-500">{isPremium ? "Pro Plan" : "Free Plan"}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {navigationGroups.map((group) => (
                                <div key={group.label}>
                                    <DropdownMenuLabel className="text-xs text-slate-500">{group.label}</DropdownMenuLabel>
                                    {group.items.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => {
                                                setExpandedGroup(null)
                                            }} className="w-full">
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Icon className="h-4 w-4 mr-2" />
                                                    {item.label}
                                                </DropdownMenuItem>
                                            </Link>
                                        )
                                    })}
                                    <DropdownMenuSeparator />
                                </div>
                            ))}

                            {!isPremium && (
                                <Link href="/dashboard/upgrade">
                                    <DropdownMenuItem className="bg-gradient-to-r from-teal-600 to-blue-600 hover:text-white text-white hover:from-teal-700 hover:to-blue-700 cursor-pointer">
                                        <Crown className="h-4 w-4 mr-2 text-white" />
                                        Upgrade to Pro
                                    </DropdownMenuItem>
                                </Link>
                            )}

                            {selectedRestaurant && (
                                <Link href={`/${selectedRestaurant.slug}`} target="_blank">
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Globe2 className="h-4 w-4 mr-2" />
                                        Visit Site
                                    </DropdownMenuItem>
                                </Link>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:!bg-red-500 hover:text-white">
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
