"use client"

import { Calendar, DollarSign, Map, Plus, Settings, Users } from "lucide-react"
import { useState } from "react"

import AreasPage from "./_components/areas"
import PaymentsPage from "./_components/payments"
import NewReservationPage from "./_components/reservations/new-reservation-page"
import Reservations from "./_components/reservations/reservations"
import SettingsPage from "./_components/settings"
import TablesPage from "./_components/tables"

const ReservationsPage = () => {
    const [activeTab, setActiveTab] = useState("reservations")

    const tabs = [
        { key: "add-new", label: "Add New", icon: <Plus className="w-4 h-4" /> },
        { key: "reservations", label: "Reservations", icon: <Calendar className="w-4 h-4" /> },
        { key: "tables", label: "Tables", icon: <Users className="w-4 h-4" /> },
        { key: "areas", label: "Areas", icon: <Map className="w-4 h-4" /> },
        { key: "payments", label: "Payments", icon: <DollarSign className="w-4 h-4" /> },
        { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
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
            case "add-new":
                return <NewReservationPage />
            default:
                return <Reservations />
        }
    }

    return (
        <>
            <main className="w-full flex flex-col bg-gray-50 min-h-screen">
                {/* Header  */}
                <div className="flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
                    <h1 className="text-lg font-semibold text-gray-800">Reservations Dashboard</h1>
                </div>
                {/* Top Tabs */}
                <nav className="flex bg-white border-b shadow-sm overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex border-b-2 border-transparent items-center gap-2 px-6 py-3 cursor-pointer text-sm font-medium transition-all whitespace-nowrap 
              ${activeTab === tab.key && tab.key !== "add-new"
                                    ? " !border-main-green text-main-green bg-gray-50"
                                    : "text-gray-600 hover:text-main-green "
                                } ${tab.key === "add-new" ? "bg-main-green text-white hover:text-white" : ""} ${activeTab === "add-new" && "!border-white"}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Main Content */}
                <section className="flex-1 p-6">{renderContent()}</section>
            </main>
        </>
    )
}

export default ReservationsPage
