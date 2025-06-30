"use client"

import type React from "react"

import { Building2, Clock, Globe2, Instagram, Phone, ShieldAlert, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sections = [
    {
        id: "business-information",
        title: "Business Information",
        icon: Building2,
        description: "Basic information about your restaurant",
        href: "/dashboard/settings/business-information",
    },
    {
        id: "contact",
        title: "Contact Information",
        icon: Phone,
        description: "How customers can reach you",
        href: "/dashboard/settings/contact",
    },
    {
        id: "change-password",
        title: "Change Password",
        icon: ShieldAlert,
        description: "Update your profile password",
        href: "/dashboard/settings/change-password",
    },
    {
        id: "hours",
        title: "Opening Hours",
        icon: Clock,
        description: "When your restaurant is open",
        href: "/dashboard/settings/hours",
    },
    {
        id: "social",
        title: "Social Media",
        icon: Instagram,
        description: "Connect your social profiles",
        href: "/dashboard/settings/social",
    },
    {
        id: "popups",
        title: "Popups",
        icon: Zap,
        description: "Manage welcome popups and notifications",
        href: "/dashboard/settings/popups",
    },
    {
        id: "integrations",
        title: "Integrations",
        icon: Globe2,
        description: "Connect third-party services",
        href: "/dashboard/settings/integrations",
    },
]

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-muted-foreground">Manage your restaurant profile and settings</p>

            </div>

            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                {/* Sidebar Navigation */}
                <div className="space-y-4">
                    {sections.map((section) => {
                        const Icon = section.icon
                        const isActive = pathname === section.href

                        return (
                            <Link
                                key={section.id}
                                href={section.href}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between group ${isActive
                                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                    : "hover:bg-gray-50 border border-transparent"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-500"}`} />
                                    <div>
                                        <div className="font-medium">{section.title}</div>
                                        <div className="text-sm text-muted-foreground">{section.description}</div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* Main Content */}
                <div className="space-y-6">{children}</div>
            </div>
        </main>
    )
}
