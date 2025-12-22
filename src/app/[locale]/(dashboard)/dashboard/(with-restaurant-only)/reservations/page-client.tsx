"use client"

import {
    Calendar,
    DollarSign,
    LayoutDashboard,
    Map,
    MessageSquare,
    Notebook,
    Plus,
    Settings,
    Users,
} from "lucide-react"
import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import AreasPage from "./_components/areas"
import OverviewPage from "./_components/overview/overview-page"
import PaymentsPage from "./_components/payments"
import QuereisPage from "./_components/queries/queries-page"
import NewReservationPage from "./_components/reservations/new-reservation-page"
import Reservations from "./_components/reservations/reservations"
import SettingsPage from "./_components/settings"
import TablesPage from "./_components/tables"
import PoliciesTab from "./_components/policies/policies-tab"

const DEFAULT_TAB = "reservations"

const VALID_TABS = new Set([
    "add-new",
    "overview",
    "reservations",
    "tables",
    "areas",
    "payments",
    "queries",
    "policies",
    "settings",
])

export default function ReservationsPage() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const activeTab = useMemo(() => {
        const tab = searchParams.get("tab") ?? DEFAULT_TAB
        return VALID_TABS.has(tab) ? tab : DEFAULT_TAB
    }, [searchParams])

    const setTab = useCallback(
        (tabKey: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set("tab", tabKey)
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        },
        [router, pathname, searchParams]
    )

    const tabs = [
        { key: "add-new", label: "Add New", icon: <Plus className="w-4 h-4" /> },
        { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
        { key: "reservations", label: "Reservations", icon: <Calendar className="w-4 h-4" /> },
        { key: "tables", label: "Tables", icon: <Users className="w-4 h-4" /> },
        { key: "areas", label: "Areas", icon: <Map className="w-4 h-4" /> },
        { key: "payments", label: "Payments", icon: <DollarSign className="w-4 h-4" /> },
        { key: "queries", label: "Queries", icon: <MessageSquare className="w-4 h-4" /> },
        { key: "policies", label: "Policies", icon: <Notebook className="w-4 h-4" /> },
        { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case "reservations":
                return <Reservations />
            case "overview":
                return <OverviewPage />
            case "tables":
                return <TablesPage />
            case "areas":
                return <AreasPage />
            case "payments":
                return <PaymentsPage />
            case "settings":
                return <SettingsPage />
            case "add-new":
                return <NewReservationPage />
            case "queries":
                return <QuereisPage />
            case "policies":
                return <PoliciesTab />
            default:
                return <Reservations />
        }
    }

    return (
        <main className="w-full flex flex-col bg-gray-50 min-h-screen">
            <nav className="flex bg-white border-b shadow-sm overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setTab(tab.key)}
                        className={`flex border-b-2 border-transparent items-center gap-2 px-6 py-3 cursor-pointer text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.key && tab.key !== "add-new"
                                ? "!border-main-green text-main-green bg-gray-50"
                                : "text-gray-600 hover:text-main-green"
                            }
              ${tab.key === "add-new" ? "bg-main-green text-white hover:text-white" : ""}
              ${activeTab === "add-new" && tab.key === "add-new" ? "!border-white" : ""}
            `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>

            <section className="flex-1 p-6">{renderContent()}</section>
        </main>
    )
}
