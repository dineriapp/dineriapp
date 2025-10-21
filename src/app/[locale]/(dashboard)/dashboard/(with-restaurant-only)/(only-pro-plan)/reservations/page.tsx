import Reservations from './_components/reservations'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, Calendar, Clock, DollarSign, Map, Settings, Users } from "lucide-react"

const ReservationsPage = () => {
    return (
        <main className="max-w-[1200px] mx-auto px-4 py-8">
            <Tabs defaultValue="payments" className="w-full">
                <TabsList className="bg-transparent flex gap-2 p-0">
                    <TabsTrigger
                        value="reservations"
                        className="data-[state=active]:!bg-[#0f172a] transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Calendar className="h-4 w-4" />
                        Reservations
                    </TabsTrigger>

                    <TabsTrigger
                        value="tables"
                        className="data-[state=active]:!bg-[#0f172a] transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Users className="h-4 w-4" />
                        Tables
                    </TabsTrigger>

                    <TabsTrigger
                        value="areas"
                        className="data-[state=active]:!bg-[#0f172a] transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Map className="h-4 w-4" />
                        Areas
                    </TabsTrigger>

                    <TabsTrigger
                        value="waitlist"
                        className="data-[state=active]:!bg-[#0f172a] transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <Clock className="h-4 w-4" />
                        Waitlist
                    </TabsTrigger>

                    <TabsTrigger
                        value="analytics"
                        className="data-[state=active]:!bg-[#0f172a] transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <BarChart2 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>

                    <TabsTrigger
                        value="payments"
                        className="data-[state=active]:!bg-[#0f172a] transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
                    >
                        <DollarSign className="h-4 w-4" />
                        Payments
                    </TabsTrigger>

                    <TabsTrigger
                        value="settings"
                        className="data-[state=active]:!bg-[#0f172a] transition-all data-[state=active]:!text-white px-4 rounded-lg flex items-center gap-2 cursor-pointer bg-white"
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
                    <div className="p-4 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Tables</h2>
                        <p>Set up and manage your restaurant tables.</p>
                    </div>
                </TabsContent>

                <TabsContent value="areas" className='!pt-4'>
                    <div className="p-4 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Areas</h2>
                        <p>Define different seating areas and sections.</p>
                    </div>
                </TabsContent>

                <TabsContent value="waitlist" className='!pt-4'>
                    <div className="p-4 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Waitlist</h2>
                        <p>Track and manage your waitlisted customers.</p>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className='!pt-4'>
                    <div className="p-4 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Analytics</h2>
                        <p>View key performance insights and reports.</p>
                    </div>
                </TabsContent>

                <TabsContent value="payments" className='!pt-4'>
                    <div className="p-4 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Payments</h2>
                        <p>Process and review all payment transactions here.</p>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className='!pt-4'>
                    <div className="p-4 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Settings</h2>
                        <p>Configure restaurant settings and preferences.</p>
                    </div>
                </TabsContent>
            </Tabs>

        </main>
    )
}

export default ReservationsPage
