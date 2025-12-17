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
import { Switch } from "@/components/ui/switch"
import { useAreas, useCreateArea, useDeleteArea, useUpdateArea } from "@/lib/area-queries"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { Area } from "@prisma/client"
import { ArrowDownRight, ArrowUpRight, MapPin, Pencil, PlusCircle, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

export default function AreasPage() {
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const { selectedRestaurant: restaurant } = useRestaurantStore()
    const restaurantId = restaurant?.id
    const t = useTranslations("reservationAreasPage")
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
            <Card className="bg-white border shadow-sm gap-2">
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
        return <LoadingUI text={t("loadingText")} />
    }

    if (isLoading) {
        return <LoadingUI text={t("loadingAreasText")} />
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t("pageTitle")}
                    </h2>
                    <p className="text-slate-600 mt-1">
                        {t("pageDescription")}
                    </p>
                </div>
                <div className="text-center text-red-500">
                    {t("errorLoadingMessagePrefix")}
                    {error.message}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {t("pageTitle")}
                </h2>
                <p className="text-slate-600 mt-1">
                    {t("pageDescription")}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    title={t("stats.totalAreas")}
                    value={totalAreas}
                    icon={<MapPin className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.total}
                />
                <StatCard
                    title={t("stats.activeAreas")}
                    value={totalActive}
                    icon={<ToggleRight className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.active}
                />
                <StatCard
                    title={t("stats.inactiveAreas")}
                    value={totalInactive}
                    icon={<ToggleLeft className="h-5 w-5 text-gray-400" />}
                    trendValue={trend.inactive}
                />
            </div>

            {/* Filters + Add */}
            <div className="flex justify-between items-center gap-4">
                <Input
                    placeholder={t("search.placeholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[250px] bg-white"
                />

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            {t("actions.addAreaButton")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                            <DialogTitle>
                                {t("actions.addNewAreaTitle")}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    {t("actions.areaNameLabel")}
                                </Label>
                                <Input
                                    placeholder={t("actions.areaNamePlaceholder")}
                                    value={newArea.name}
                                    onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    {t("actions.statusLabel")}
                                </Label>
                                <Select value={newArea.active} onValueChange={(val) => setNewArea({ ...newArea, active: val })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("actions.statusPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">
                                            {t("actions.active")}
                                        </SelectItem>
                                        <SelectItem value="false">
                                            {t("actions.inactive")}
                                        </SelectItem>
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
                                {createAreaMutation.isPending ? t("actions.savingButton") : t("actions.saveButton")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAreas.map((area) => (
                    <Card
                        key={area.id}
                        className="relative gap-0 overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-[2px] pb-4 pt-4"
                    >
                        {/* Accent bar on top (status color) */}
                        <div
                            className={`absolute top-0 left-0 w-full h-1 ${area.active ? "bg-green-500" : "bg-red-400"
                                }`}
                        />

                        {/* Action Icons */}
                        <div className="absolute top-4 right-4 flex items-center gap-3">
                            <Pencil
                                onClick={() => {
                                    setEditArea(area)
                                    setEditDialogOpen(true)
                                }}
                                className="h-4 w-4 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors"
                            />
                            <Trash2
                                onClick={() => handleDelete(area.id)}
                                className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                            />
                        </div>

                        {/* Header */}
                        <CardHeader className="!py-2 !px-4">
                            <CardTitle className="text-lg font-semibold text-gray-800">{area.name}</CardTitle>
                        </CardHeader>

                        {/* Body */}
                        <CardContent className="flex items-center justify-between border border-gray-100 bg-gray-50 rounded-xl px-2 py-2 mx-4 mt-2">
                            <Badge
                                variant="outline"
                                className={`text-sm font-semibold px-3 py-1 rounded-lg shadow-sm ${area.active
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                            >
                                {area.active ? t("actions.active") : t("actions.inactive")}
                            </Badge>

                            <Switch
                                checked={area.active}
                                onCheckedChange={() => toggleStatus(area.id)}
                                disabled={updateAreaMutation.isPending}
                                className="scale-110 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 transition-transform duration-300"
                            />
                        </CardContent>

                        {/* Footer (optional info) */}
                        <div className="px-4 pt-2 text-xs text-gray-400 border-t border-gray-100 mt-3">
                            {t("card.lastUpdatedLabel")}{" "}
                            <span className="text-gray-600 font-medium">
                                {new Date(area.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </Card>
                ))}

            </div>

            {filteredAreas.length === 0 && <div className="p-6 text-center text-sm text-gray-500">{t("emptyState.noAreasFound")}</div>}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>
                            {t("actions.editAreaTitle")}
                        </DialogTitle>
                    </DialogHeader>
                    {editArea && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    {t("actions.areaNameLabel")}
                                </Label>
                                <Input
                                    placeholder={t("actions.areaNamePlaceholder")}
                                    value={editArea.name}
                                    onChange={(e) => setEditArea({ ...editArea, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    {t("actions.statusLabel")}
                                </Label>
                                <Select
                                    value={editArea.active ? "true" : "false"}
                                    onValueChange={(val) => setEditArea({ ...editArea, active: val === "true" })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("actions.statusPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">
                                            {t("actions.active")}
                                        </SelectItem>
                                        <SelectItem value="false">
                                            {t("actions.inactive")}
                                        </SelectItem>
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
                            {updateAreaMutation.isPending ? t("actions.savingButton") : t("actions.saveChangesButton")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
