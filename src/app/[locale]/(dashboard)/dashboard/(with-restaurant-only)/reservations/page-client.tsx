"use client"

import { Calendar, DollarSign, Map, Plus, Settings, Users } from "lucide-react"
import { useState } from "react"

import AreasPage from "./_components/areas"
import PaymentsPage from "./_components/payments"
import Reservations from "./_components/reservations/reservations"
import SettingsPage from "./_components/settings"
import TablesPage from "./_components/tables"

const ReservationsPage = () => {
    const [activeTab, setActiveTab] = useState("reservations")

    const tabs = [
        {
            key: "reservations", label: "Reservations", icon: <Calendar className="w-4 h-4" />,
        },
        { key: "tables", label: "Tables", icon: <Users className="w-4 h-4" />, },
        { key: "areas", label: "Areas", icon: <Map className="w-4 h-4" />, },
        { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" />, },
        { key: "payments", label: "Payments", icon: <DollarSign className="w-4 h-4" />, },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case "reservations":
                return <Reservations />
            case "tables":
                return <TablesPage />
            case "areas":
                return <AreasPage />
            case "payments":
                return <PaymentsPage />
            case "settings":
                return <SettingsPage />
            default:
                return <Reservations />
        }
    }

    return (
        <main className="w-full flex items-start justify-start h-[calc(100dvh-63px)] bg-gray-50">
            {/* Sidebar */}
            <aside className="w-[230px] h-full bg-white border-r shadow-sm flex flex-col">
                {/* New Reservation Button */}
                <div className="p-3 border-b">
                    <button className="w-full flex items-center justify-center gap-2 cursor-pointer bg-main-green text-white py-2.5 rounded-lg text-sm font-medium hover:bg-main-green/70 transition">
                        <Plus className="w-4 h-4" />
                        New Reservation
                    </button>
                </div>

                {/* Menu Sections */}
                <nav className="flex-1 flex-col flex overflow-y-auto p-3 gap-0.5">
                    {tabs.map((tab) => (
                        <>
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center cursor-pointer justify-between w-full px-4 py-2.5 rounded-md text-sm font-medium transition-all
                      ${activeTab === tab.key
                                        ? "bg-main-green text-white shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.icon}
                                    {tab.label}
                                </span>
                            </button>
                        </>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <section className="flex-1 h-full overflow-y-auto p-6">{renderContent()}</section>
        </main>
    )
}

export default ReservationsPage
