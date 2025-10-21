"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table as UITable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
    PlusCircle,
    CheckCircle,
    XCircle,
    Users,
    Pencil,
    Eye,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 🧾 Dummy table data
const dummyTables = [
    {
        id: "1",
        tableNumber: "T1",
        capacity: 2,
        location: "Patio",
        status: "ACTIVE",
    },
    {
        id: "2",
        tableNumber: "T2",
        capacity: 4,
        location: "Main Hall",
        status: "ACTIVE",
    },
    {
        id: "3",
        tableNumber: "T3",
        capacity: 6,
        location: "Bar",
        status: "INACTIVE",
    },
]

type TableStatus = "ACTIVE" | "INACTIVE"

export default function TablesPage() {
    const [tables, setTables] = useState(dummyTables)
    const [search, setSearch] = useState("")
    const [newTable, setNewTable] = useState({
        tableNumber: "",
        capacity: "",
        location: "",
        status: "ACTIVE",
    })
    const [dialogOpen, setDialogOpen] = useState(false)

    // 📊 Stats
    const totalTables = tables.length
    const totalActive = tables.filter((t) => t.status === "ACTIVE").length
    const totalInactive = tables.filter((t) => t.status === "INACTIVE").length
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)

    const trend = {
        total: 5,
        active: 10,
        inactive: -3,
        capacity: 8,
    }

    const filtered = tables.filter((t) =>
        t.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase())
    )

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
            <Card className="bg-white border">
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
        <div className="space-y-6 p-6">
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
                    icon={<CheckCircle className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.active}
                />
                <StatCard
                    title="Inactive"
                    value={totalInactive}
                    icon={<XCircle className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.inactive}
                />
                <StatCard
                    title="Total Capacity"
                    value={totalCapacity}
                    icon={<PlusCircle className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.capacity}
                />
            </div>

            {/* --- Filters & Add --- */}
            <div className="flex justify-between items-center gap-4">
                <Input
                    placeholder="Search by table number or location"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[300px] bg-white"
                />

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Add Table
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
                                onChange={(e) =>
                                    setNewTable({ ...newTable, tableNumber: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Capacity"
                                type="number"
                                value={newTable.capacity}
                                onChange={(e) =>
                                    setNewTable({ ...newTable, capacity: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Location"
                                value={newTable.location}
                                onChange={(e) =>
                                    setNewTable({ ...newTable, location: e.target.value })
                                }
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

            {/* --- Table --- */}
            <div className="border rounded-lg overflow-hidden bg-white">
                <UITable>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Table #</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>{t.tableNumber}</TableCell>
                                <TableCell>{t.capacity}</TableCell>
                                <TableCell>{t.location}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            t.status === "ACTIVE" ? "default" : "secondary"
                                        }
                                    >
                                        {t.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" /> View
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                                        <Pencil className="h-4 w-4" /> Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex items-center gap-1"
                                        onClick={() => handleDelete(t.id)}
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </UITable>
                {filtered.length === 0 && (
                    <div className="p-6 text-center text-sm text-gray-500">
                        No tables found.
                    </div>
                )}
            </div>
        </div>
    )
}
