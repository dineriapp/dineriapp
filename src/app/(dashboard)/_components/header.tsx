"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Utensils,
  Menu,
  Settings,
  LinkIcon,
  Home,
  LogOut,
  BarChart,
  Palette,
  UtensilsCrossed,
  Calendar,
  ChevronDown,
  Globe2,
  Crown,
  Layout,
  QrCode,
  HelpCircle,
  Plus,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Define Restaurant type
interface Restaurant {
  id: string
  user_id: string
  name: string
  bio: string
  logo_url: string | null
  bg_color: string
  accent_color: string
  bg_type: string
  bg_gradient_start: string
  bg_gradient_end: string
  button_style: string
  button_variant: string
  font_family: string
  slug: string
  created_at: string
  subscription_plan: string
  subscription_status: string
}

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

const dummyRestaurants: Restaurant[] = [
  {
    id: "1",
    user_id: "dummy-user-1",
    name: "Gourmet Palace",
    bio: "Fine dining experience.",
    logo_url: null,
    bg_color: "#ffffff",
    accent_color: "#FFC107",
    bg_type: "color",
    bg_gradient_start: "",
    bg_gradient_end: "",
    button_style: "rounded",
    button_variant: "solid",
    font_family: "Arial",
    slug: "gourmet-palace",
    created_at: new Date().toISOString(),
    subscription_plan: "free",
    subscription_status: "active",
  },
  {
    id: "2",
    user_id: "dummy-user-2",
    name: "Bistro Delight",
    bio: "Casual and cozy.",
    logo_url: null,
    bg_color: "#000000",
    accent_color: "#FF5722",
    bg_type: "gradient",
    bg_gradient_start: "#000000",
    bg_gradient_end: "#434343",
    button_style: "pill",
    button_variant: "outline",
    font_family: "Roboto",
    slug: "bistro-delight",
    created_at: new Date().toISOString(),
    subscription_plan: "pro",
    subscription_status: "active",
  },
]

export function DashboardHeader() {
  const [restaurant] = useState<Restaurant>(dummyRestaurants[1]) // Pick either 0 or 1
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setExpandedGroup(null)
  }, [pathname])

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
    toast("Signed out")
    router.push("/")
  }

  const toggleGroup = (label: string) => {
    setExpandedGroup(expandedGroup === label ? null : label)
  }

  const handleNavigation = (href: string) => {
    setExpandedGroup(null)
    router.push(href)
  }

  const isPremium = restaurant?.subscription_plan === "pro" || restaurant?.subscription_plan === "enterprise"

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2 rounded-xl transition-transform group-hover:scale-110">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent hidden sm:inline-block">
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
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item.href)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${isActive
                            ? "bg-gradient-to-r from-teal-50 to-blue-50 text-teal-600"
                            : "text-slate-700 hover:bg-slate-50 hover:text-teal-600"
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/dashboard/create" className="hidden sm:flex">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-200 !h-[38px] text-slate-700 hover:bg-slate-50 hover:text-teal-600 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Restaurant</span>
            </Button>
          </Link>

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

          {restaurant && (
            <Link href={`/${restaurant.slug}`} target="_blank">
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center text-white">
                  {restaurant?.name.charAt(0) || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{restaurant?.name || "User"}</span>
                  <span className="text-xs text-slate-500">{isPremium ? "Pro Plan" : "Free Plan"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs text-slate-500">Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {navigationGroups.map((group) => (
                <div key={group.label}>
                  <DropdownMenuLabel className="text-xs text-slate-500">{group.label}</DropdownMenuLabel>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button key={item.href} onClick={() => handleNavigation(item.href)} className="w-full">
                        <DropdownMenuItem className="cursor-pointer">
                          <Icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </DropdownMenuItem>
                      </button>
                    )
                  })}
                  <DropdownMenuSeparator />
                </div>
              ))}

              {!isPremium && (
                <Link href="/dashboard/upgrade">
                  <DropdownMenuItem className="bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700 cursor-pointer">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </Link>
              )}

              {restaurant && (
                <Link href={`/${restaurant.slug}`} target="_blank">
                  <DropdownMenuItem className="cursor-pointer">
                    <Globe2 className="h-4 w-4 mr-2" />
                    Visit Site
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {navigationGroups.map((group) => (
                <div key={group.label}>
                  <DropdownMenuLabel className="text-xs text-slate-500">{group.label}</DropdownMenuLabel>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button key={item.href} onClick={() => handleNavigation(item.href)} className="w-full">
                        <DropdownMenuItem className="cursor-pointer">
                          <Icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </DropdownMenuItem>
                      </button>
                    )
                  })}
                  <DropdownMenuSeparator />
                </div>
              ))}

              <Link href="/dashboard/create">
                <DropdownMenuItem className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  New Restaurant
                </DropdownMenuItem>
              </Link>

              {!isPremium && (
                <Link href="/dashboard/upgrade">
                  <DropdownMenuItem className="bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700 cursor-pointer">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </Link>
              )}

              {restaurant && (
                <Link href={`/${restaurant.slug}`} target="_blank">
                  <DropdownMenuItem className="cursor-pointer">
                    <Globe2 className="h-4 w-4 mr-2" />
                    Visit Site
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
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
