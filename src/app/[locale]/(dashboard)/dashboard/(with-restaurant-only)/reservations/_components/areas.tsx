"use client"

import type React from "react"

import LoadingUI from "@/components/loading-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { ArrowDownRight, ArrowUpRight, MapPin, Pencil, PlusCircle, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { useState } from "react"
import { Area } from "@prisma/client"
import { useAreas, useCreateArea, useDeleteArea, useUpdateArea } from "@/lib/area-queries"

export default function AreasPage() {
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const { selectedRestaurant: restaurant } = useRestaurantStore()
    const restaurantId = restaurant?.id

    const { data: areas = [], isLoading, error } = useAreas(restaurantId)
    const createAreaMutation = useCreateArea(restaurantId)
    const updateAreaMutation = useUpdateArea()
    const deleteAreaMutation = useDeleteArea()

    const [newArea, setNewArea] = useState({
        name: "",
        active: "true",
    })
    const [editArea, setEditArea] = useState<Area | null>(null)

    const totalActive = areas.filter((a) => a.active).length
    const totalInactive = areas.filter((a) => !a.active).length
    const totalAreas = areas.length

    const trend = {
        total: 4,
        active: 10,
        inactive: -2,
    }

    const filteredAreas = areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))

    const handleAddArea = async () => {
        if (!newArea.name.trim()) return

        try {
            await createAreaMutation.mutateAsync({
                name: newArea.name,
                active: newArea.active === "true",
            })
            setDialogOpen(false)
            setNewArea({ name: "", active: "true" })
        } catch (err) {
            console.error("Failed to create area:", err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteAreaMutation.mutateAsync(id)
        } catch (err) {
            console.error("Failed to delete area:", err)
        }
    }

    const handleEdit = async () => {
        if (!editArea) return

        try {
            await updateAreaMutation.mutateAsync({
                areaId: editArea.id,
                data: {
                    name: editArea.name,
                    active: editArea.active,
                },
            })
            setEditDialogOpen(false)
            setEditArea(null)
        } catch (err) {
            console.error("Failed to update area:", err)
        }
    }

    const toggleStatus = async (id: string) => {
        const area = areas.find((a) => a.id === id)
        if (!area) return

        try {
            await updateAreaMutation.mutateAsync({
                areaId: id,
                data: { active: !area.active },
            })
        } catch (err) {
            console.error("Failed to toggle area status:", err)
        }
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
                    <span className={`flex items-center text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                        {Math.abs(trendValue)}%
                    </span>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{value}</p>
                </CardContent>
            </Card>
        )
    }

    if (!restaurant) {
        return <LoadingUI text="Loading..." />
    }

    if (isLoading) {
        return <LoadingUI text="Loading areas..." />
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Areas</h2>
                    <p className="text-slate-600 mt-1">Organize your restaurant into different areas</p>
                </div>
                <div className="text-center text-red-500">Error loading Areas: {error.message}</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Areas</h2>
                <p className="text-slate-600 mt-1">Organize your restaurant into different areas</p>
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
                            <div className="space-y-2">
                                <Label>Area Name</Label>
                                <Input
                                    placeholder="Area Name"
                                    value={newArea.name}
                                    onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={newArea.active} onValueChange={(val) => setNewArea({ ...newArea, active: val })}>
                                    <SelectTrigger className="w-full">
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
                                disabled={createAreaMutation.isPending}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                {createAreaMutation.isPending ? "Saving..." : "Save"}
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
                                    setEditArea(area)
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
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <Badge
                                variant="outline"
                                className={`w-fit px-2 ${area.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                                {area.active ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleStatus(area.id)}
                                disabled={updateAreaMutation.isPending}
                                className="text-xs"
                            >
                                Toggle
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredAreas.length === 0 && <div className="p-6 text-center text-sm text-gray-500">No areas found.</div>}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Area</DialogTitle>
                    </DialogHeader>
                    {editArea && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Area Name</Label>
                                <Input
                                    placeholder="Area Name"
                                    value={editArea.name}
                                    onChange={(e) => setEditArea({ ...editArea, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={editArea.active ? "true" : "false"}
                                    onValueChange={(val) => setEditArea({ ...editArea, active: val === "true" })}
                                >
                                    <SelectTrigger className="w-full">
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
                            disabled={updateAreaMutation.isPending}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {updateAreaMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
