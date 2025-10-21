"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowDownRight,
    ArrowUpRight,
    PlusCircle,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Users,
} from "lucide-react"
import { useState } from "react"

// 🧾 Dummy table data
const dummyTables = [
    { id: "1", tableNumber: "A4", capacity: 6, location: "Patio", status: "INACTIVE" },
    { id: "2", tableNumber: "A45", capacity: 5, location: "Main Hall", status: "ACTIVE" },
    { id: "3", tableNumber: "B12", capacity: 4, location: "Bar", status: "ACTIVE" },
    { id: "4", tableNumber: "C9", capacity: 2, location: "Lounge", status: "INACTIVE" },
    { id: "5", tableNumber: "D7", capacity: 8, location: "Terrace", status: "ACTIVE" },
    { id: "6", tableNumber: "E3", capacity: 2, location: "Patio", status: "ACTIVE" },
    { id: "7", tableNumber: "F1", capacity: 6, location: "Private Room", status: "INACTIVE" },
    { id: "8", tableNumber: "G10", capacity: 4, location: "Main Hall", status: "ACTIVE" },
    { id: "9", tableNumber: "H5", capacity: 5, location: "Bar", status: "INACTIVE" },
    { id: "10", tableNumber: "I8", capacity: 3, location: "Lounge", status: "ACTIVE" },
    { id: "11", tableNumber: "J2", capacity: 7, location: "Terrace", status: "INACTIVE" },
    { id: "12", tableNumber: "K11", capacity: 4, location: "Patio", status: "ACTIVE" },
    { id: "13", tableNumber: "L6", capacity: 6, location: "Main Hall", status: "ACTIVE" },
    { id: "14", tableNumber: "M15", capacity: 10, location: "Private Room", status: "INACTIVE" },
]

type TableStatus = "ACTIVE" | "INACTIVE"

export default function TablesGridPage() {
    const [tables, setTables] = useState(dummyTables)
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)

    const [newTable, setNewTable] = useState({
        tableNumber: "",
        capacity: "",
        location: "",
        status: "ACTIVE",
    })

    // 📊 Stats
    const totalTables = tables.length
    const totalActive = tables.filter((t) => t.status === "ACTIVE").length
    const totalInactive = tables.filter((t) => t.status === "INACTIVE").length
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)

    const trend = {
        total: 5,
        active: 10,
        inactive: -2,
        capacity: 8,
    }

    const filteredTables = tables.filter((t) => {
        const matchStatus = statusFilter === "ALL" || t.status === statusFilter
        const matchSearch =
            t.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
            t.location.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    const toggleStatus = (id: string) => {
        setTables((prev) =>
            prev.map((t) =>
                t.id === id
                    ? { ...t, status: t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
                    : t
            )
        )
    }

    const handleAddTable = () => {
        const newId = (Math.random() * 100000).toFixed(0)
        setTables([
            ...tables,
            {
                id: newId,
                tableNumber: newTable.tableNumber,
                capacity: Number(newTable.capacity),
                location: newTable.location,
                status: newTable.status as TableStatus,
            },
        ])
        setDialogOpen(false)
        setNewTable({ tableNumber: "", capacity: "", location: "", status: "ACTIVE" })
    }

    const handleDelete = (id: string) => {
        setTables(tables.filter((t) => t.id !== id))
    }

    const StatCard = ({
        title,
        value,
        icon,
        trendValue,
    }: {
        title: string
        value: number
        icon: React.ReactNode
        trendValue: number
    }) => {
        const isPositive = trendValue >= 0
        return (
            <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        {icon} {title}
                    </CardTitle>
                    <span
                        className={`flex items-center text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {isPositive ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(trendValue)}%
                    </span>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{value}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Tables</h2>
                <p className="text-slate-600 mt-1">Manage your restaurant tables and floor plan</p>
            </div>
            {/* --- Stats --- */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Total Tables"
                    value={totalTables}
                    icon={<Users className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.total}
                />
                <StatCard
                    title="Active"
                    value={totalActive}
                    icon={<ToggleRight className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.active}
                />
                <StatCard
                    title="Inactive"
                    value={totalInactive}
                    icon={<ToggleLeft className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.inactive}
                />
                <StatCard
                    title="Total Capacity"
                    value={totalCapacity}
                    icon={<PlusCircle className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.capacity}
                />
            </div>

            {/* --- Filters --- */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] !bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Search table number or location"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[250px] !bg-white"
                    />
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-main-green text-white hover:bg-main-green/80 cursor-pointer">
                            <PlusCircle className="h-4 w-4" /> Add Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                            <DialogTitle>Add New Table</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Table Number"
                                value={newTable.tableNumber}
                                onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                            />
                            <Input
                                placeholder="Capacity"
                                type="number"
                                value={newTable.capacity}
                                onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                            />
                            <Input
                                placeholder="Location"
                                value={newTable.location}
                                onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                            />
                            <Select
                                value={newTable.status}
                                onValueChange={(val) => setNewTable({ ...newTable, status: val })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTable} className="bg-green-600 text-white hover:bg-green-700">
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* --- Grid Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTables.map((table) => (
                    <Card key={table.id} className="bg-white border gap-1 shadow-sm relative">
                        <div className="absolute top-5 right-5 cursor-pointer">
                            <Trash2
                                onClick={() => handleDelete(table.id)}
                                className="h-4 w-4 text-red-400 hover:text-red-500 transition"
                            />
                        </div>
                        <CardHeader className="pb-2 flex justify-between items-start">
                            <div className="flex items-start flex-col gap-1">
                                <CardTitle className="text-xl font-bold">{table.tableNumber}</CardTitle>
                                <p className="text-sm text-gray-500">Seats {table.capacity}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 w-fit">
                                Unassigned
                            </Badge>

                            <Button
                                onClick={() => toggleStatus(table.id)}
                                variant="outline"
                                className={`flex items-center justify-center gap-2 ${table.status === "ACTIVE" ? "border-green-500 text-green-600" : "border-gray-300 text-gray-500"
                                    }`}
                            >
                                {table.status === "ACTIVE" ? (
                                    <>
                                        <ToggleRight className="h-4 w-4 text-green-500" /> Active
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft className="h-4 w-4 text-gray-400" /> Inactive
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTables.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">
                    No tables found.
                </div>
            )}
        </div>
    )
}
