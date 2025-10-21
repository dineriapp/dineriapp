import Reservations from './_components/reservations'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, Map, Settings, Users } from "lucide-react"
import AreasPage from './_components/areas'
import TablesPage from './_components/tables'
import SettingsPage from './_components/settings'
import PaymentsPage from './_components/payments'

const ReservationsPage = () => {
    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <Tabs defaultValue="reservations" className="w-full">
                <TabsList className="bg-transparent flex gap-2 p-0">
                    <TabsTrigger
                        value="reservations"
                        className="data-[state=active]:!bg-[#0f172a] !h-10 transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Calendar className="h-4 w-4" />
                        Reservations
                    </TabsTrigger>

                    <TabsTrigger
                        value="tables"
                        className="data-[state=active]:!bg-[#0f172a] transition-all !h-10 data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Users className="h-4 w-4" />
                        Tables
                    </TabsTrigger>

                    <TabsTrigger
                        value="areas"
                        className="data-[state=active]:!bg-[#0f172a] transition-all !h-10 data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Map className="h-4 w-4" />
                        Areas
                    </TabsTrigger>

                    <TabsTrigger
                        value="payments"
                        className="data-[state=active]:!bg-[#0f172a] transition-all !h-10 data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <DollarSign className="h-4 w-4" />
                        Payments
                    </TabsTrigger>

                    <TabsTrigger
                        value="settings"
                        className="data-[state=active]:!bg-[#0f172a] transition-all !h-10 data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>
                {/* --- Tabs Content --- */}
                <TabsContent value="reservations" className='!pt-4'>
                    <Reservations />
                </TabsContent>

                <TabsContent value="tables" className='!pt-4'>
                    <TablesPage />
                </TabsContent>

                <TabsContent value="areas" className='!pt-4'>
                    <AreasPage />
                </TabsContent>

                <TabsContent value="payments" className='!pt-4'>
                    <PaymentsPage />
                </TabsContent>

                <TabsContent value="settings" className='!pt-4'>
                    <SettingsPage />
                </TabsContent>
            </Tabs>

        </main>
    )
}

export default ReservationsPage
