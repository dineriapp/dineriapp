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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowDownRight,
    ArrowUpRight,
    MapPin,
    Pencil,
    PlusCircle,
    ToggleLeft,
    ToggleRight,
    Trash2,
} from "lucide-react"
import { useState } from "react"

// 🧾 Dummy area data
const dummyAreas = [
    { id: "1", name: "Balcony", totalTables: 8, active: true },
    { id: "2", name: "Basement", totalTables: 4, active: false },
    { id: "3", name: "Rooftop", totalTables: 12, active: true },
    { id: "4", name: "Patio", totalTables: 6, active: true },
    { id: "5", name: "Main Hall", totalTables: 10, active: true },
    { id: "6", name: "Private Room", totalTables: 2, active: false },
]

export default function AreasPage() {
    const [areas, setAreas] = useState(dummyAreas)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [newArea, setNewArea] = useState({
        name: "",
        totalTables: "",
        active: "true",
    })
    const [editArea, setEditArea] = useState<any>(null)

    const totalActive = dummyAreas.filter((t) => t.active === true).length
    const totalInactive = dummyAreas.filter((t) => t.active === false).length

    const totalAreas = areas.length
    const trend = {
        total: 4,
        tables: 8,
        active: 10,
        inactive: -2,
    }

    const filteredAreas = areas.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAddArea = () => {
        const newId = (Math.random() * 100000).toFixed(0)
        setAreas([
            ...areas,
            {
                id: newId,
                name: newArea.name,
                totalTables: Number(newArea.totalTables),
                active: newArea.active === "true",
            },
        ])
        setDialogOpen(false)
        setNewArea({ name: "", totalTables: "", active: "true" })
    }

    const handleDelete = (id: string) => {
        setAreas(areas.filter((a) => a.id !== id))
    }

    const handleEdit = () => {
        setAreas((prev) =>
            prev.map((a) =>
                a.id === editArea.id
                    ? {
                        ...a,
                        name: editArea.name,
                        totalTables: Number(editArea.totalTables),
                        active: editArea.active === "true",
                    }
                    : a
            )
        )
        setEditDialogOpen(false)
        setEditArea(null)
    }

    const toggleStatus = (id: string) => {
        setAreas((prev) =>
            prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
        )
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
                <h2 className="text-2xl font-bold text-slate-900">Areas</h2>
                <p className="text-slate-600 mt-1">
                    Organize your restaurant into different areas
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    title="Total Areas"
                    value={totalAreas}
                    icon={<MapPin className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.total}
                />
                <StatCard
                    title="Active Areas"
                    value={totalActive}
                    icon={<ToggleRight className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.active}
                />
                <StatCard
                    title="Inactive Areas"
                    value={totalInactive}
                    icon={<ToggleLeft className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.inactive}
                />
            </div>

            {/* Filters + Add */}
            <div className="flex justify-between items-center gap-4">
                <Input
                    placeholder="Search area name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[250px] bg-white"
                />

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" /> Add Area
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                            <DialogTitle>Add New Area</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Area Name"
                                value={newArea.name}
                                onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                            />
                            <Input
                                placeholder="Number of Tables"
                                type="number"
                                value={newArea.totalTables}
                                onChange={(e) =>
                                    setNewArea({ ...newArea, totalTables: e.target.value })
                                }
                            />
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={newArea.active}
                                    onValueChange={(val) => setNewArea({ ...newArea, active: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleAddArea}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAreas.map((area) => (
                    <Card key={area.id} className="bg-white gap-1 border shadow-sm relative">
                        <div className="absolute top-5 right-5 flex gap-2">
                            <Pencil
                                onClick={() => {
                                    setEditArea({
                                        ...area,
                                        totalTables: area.totalTables.toString(),
                                        active: area.active ? "true" : "false",
                                    })
                                    setEditDialogOpen(true)
                                }}
                                className="h-4 w-4 text-gray-400 hover:text-blue-500 cursor-pointer"
                            />
                            <Trash2
                                onClick={() => handleDelete(area.id)}
                                className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer"
                            />
                        </div>
                        <CardHeader className="pb-2 flex justify-between items-start">
                            <div className="flex flex-col items-start gap-1">
                                <CardTitle className="text-base font-semibold">{area.name}</CardTitle>
                                <p className="text-sm text-gray-500">{area.totalTables} tables</p>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <Badge
                                variant="outline"
                                className={`w-fit px-2 ${area.active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {area.active ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleStatus(area.id)}
                                className="text-xs"
                            >
                                Toggle
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredAreas.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">No areas found.</div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Area</DialogTitle>
                    </DialogHeader>
                    {editArea && (
                        <div className="space-y-4">
                            <Input
                                placeholder="Area Name"
                                value={editArea.name}
                                onChange={(e) => setEditArea({ ...editArea, name: e.target.value })}
                            />
                            <Input
                                placeholder="Number of Tables"
                                type="number"
                                value={editArea.totalTables}
                                onChange={(e) =>
                                    setEditArea({ ...editArea, totalTables: e.target.value })
                                }
                            />
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={editArea.active}
                                    onValueChange={(val) => setEditArea({ ...editArea, active: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            onClick={handleEdit}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
