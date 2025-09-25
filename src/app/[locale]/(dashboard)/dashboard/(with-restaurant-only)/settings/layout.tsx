"use client"

import type React from "react"

import { Link, usePathname } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { SettingsSidebarTabs } from "@/lib/reuseable-data"
import { Locale } from "@/i18n/routing"




export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const locale: Locale = useLocale() as Locale
    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {locale === "de"
                        ? "Einstellungen"
                        : locale === "es"
                            ? "Configuración"
                            : locale === "fr"
                                ? "Paramètres"
                                : locale === "it"
                                    ? "Impostazioni"
                                    : locale === "nl"
                                        ? "Instellingen"
                                        : "Settings"}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {locale === "de"
                        ? "Verwalte dein Restaurantprofil und deine Einstellungen"
                        : locale === "es"
                            ? "Gestiona el perfil de tu restaurante y la configuración"
                            : locale === "fr"
                                ? "Gérez votre profil de restaurant et vos paramètres"
                                : locale === "it"
                                    ? "Gestisci il profilo del tuo ristorante e le impostazioni"
                                    : locale === "nl"
                                        ? "Beheer je restaurantprofiel en instellingen"
                                        : "Manage your restaurant profile and settings"}
                </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                {/* Sidebar Navigation */}
                <div className="space-y-4">
                    {SettingsSidebarTabs[locale].map((section) => {
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
