"use client"

import type React from "react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ALL_ICON_SLUGS, getLucideIconBySlug, type IconSlug } from "@/lib/get-icons"
import {
    useBulkDeleteLinks,
    useCreateLink,
    useDeleteLink,
    useLinks,
    useReorderLink,
    useUpdateLink,
} from "@/lib/link-queries"
import { isLimitReached, STRIPE_PLANS } from "@/lib/stripe-plans"
import { useUserStore } from "@/stores/auth-store"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store"
import { SubscriptionPlan } from "@prisma/client"
import { ArrowDown, ArrowUp, Edit, Plus, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import LoadingUI from "@/components/loading-ui"


export default function LinksPage() {
    const { restaurants, selectedRestaurant } = useRestaurantStore()
    const { prismaUser } = useUserStore()
    const openPopup = useUpgradePopupStore(state => state.open)

    const [newTitle, setNewTitle] = useState("")
    const [newUrl, setNewUrl] = useState("")
    const [editingLink, setEditingLink] = useState<any>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedIcon, setSelectedIcon] = useState<IconSlug>("link")

    const restaurantId = selectedRestaurant?.id

    const { data: links = [], isLoading, error } = useLinks(restaurantId)
    const createMutation = useCreateLink(restaurantId)
    const updateMutation = useUpdateLink(restaurantId)
    const deleteMutation = useDeleteLink(restaurantId)
    const bulkDeleteMutation = useBulkDeleteLinks(restaurantId)
    const reorderMutation = useReorderLink(restaurantId)

    const handleAddLink = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle.trim() || !newUrl.trim() || !restaurantId || !selectedIcon) return

        setIsAddDialogOpen(false)
        setNewTitle("")
        setNewUrl("")

        createMutation.mutate(
            { title: newTitle.trim(), url: newUrl.trim(), iconSlug: selectedIcon },
        )
    }

    const handleUpdateLink = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingLink || !newTitle.trim() || !newUrl.trim() || !selectedIcon) return

        setIsEditDialogOpen(false)
        setEditingLink(null)
        setNewTitle("")
        setNewUrl("")

        updateMutation.mutate(
            { id: editingLink.id, title: newTitle.trim(), url: newUrl.trim(), iconSlug: selectedIcon },
        )
    }

    const handleEditClick = (link: any) => {
        setEditingLink(link)
        setSelectedIcon(link?.icon_slug)
        setNewTitle(link.title)
        setNewUrl(link.url)
        setIsEditDialogOpen(true)
    }

    const toggleLinkSelection = (linkId: string) => {
        const newSelection = new Set(selectedLinks)
        if (newSelection.has(linkId)) {
            newSelection.delete(linkId)
        } else {
            newSelection.add(linkId)
        }
        setSelectedLinks(newSelection)
    }

    const toggleAllLinks = () => {
        if (selectedLinks.size === links.length) {
            setSelectedLinks(new Set())
        } else {
            setSelectedLinks(new Set(links.map((link) => link.id)))
        }
    }

    const handleBulkDelete = () => {
        bulkDeleteMutation.mutate(Array.from(selectedLinks), {})
        setSelectedLinks(new Set())
        setIsDeleteDialogOpen(false)
    }

    if (restaurants.length === 0 || !selectedRestaurant || isLoading) {
        return (
            <LoadingUI text="Loading your Link..." />
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Links</h2>
                    <p className="text-slate-500">Failed to load links for {selectedRestaurant.name}.</p>
                    <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    const isLinkLimitReached = isLimitReached({
        userPlan: prismaUser?.subscription_plan as SubscriptionPlan,
        resourceType: "links",
        currentCount: links.length,
    });

    return (
        <>
            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <h1 className=" text-4xl font-bold text-main-blue">
                            Manage Links
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Add, edit, or remove links for{" "}
                            <span className="font-medium text-main-green">{selectedRestaurant.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedLinks.size > 0 && (
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="lg"
                                        disabled={bulkDeleteMutation.isPending}
                                        className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-red-500 rounded-full !px-5 font-poppins h-[42px]"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {bulkDeleteMutation.isPending ? "Deleting..." : `Delete Selected (${selectedLinks.size})`}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete {selectedLinks.size} selected link
                                            {selectedLinks.size > 1 ? "s" : ""} from {selectedRestaurant.name}. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleBulkDelete}
                                            disabled={bulkDeleteMutation.isPending}
                                            className="bg-destructive text-white hover:opacity-80 hover:bg-destructive/90"
                                        >
                                            {bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {
                            !isLinkLimitReached ?
                                <>
                                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                        <DialogTrigger asChild>

                                            <Button
                                                size="lg"
                                                disabled={!restaurantId}
                                                className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add new link
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <form onSubmit={handleAddLink}>
                                                <DialogHeader>
                                                    <DialogTitle>Add new link</DialogTitle>
                                                    <DialogDescription>Add a link to {selectedRestaurant.name}&apos;s page</DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="title">Link Title</Label>
                                                        <Input
                                                            id="title"
                                                            value={newTitle}
                                                            onChange={(e) => setNewTitle(e.target.value)}
                                                            placeholder="e.g. View our menu"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="url">URL</Label>
                                                        <Input
                                                            id="url"
                                                            value={newUrl}
                                                            onChange={(e) => setNewUrl(e.target.value)}
                                                            placeholder="e.g. https://example.com/menu"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="icon">Icon</Label>
                                                        <Select
                                                            value={selectedIcon}
                                                            onValueChange={(val) => setSelectedIcon(val as IconSlug)}
                                                        >
                                                            <SelectTrigger id="icon" className="w-full">
                                                                <SelectValue placeholder="Select an icon" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ALL_ICON_SLUGS.map((slug) => (
                                                                    <SelectItem key={slug} value={slug}>
                                                                        {getLucideIconBySlug(slug, { className: "w-4 h-4" })}  {slug}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <DialogFooter>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsAddDialogOpen(false)
                                                            setNewTitle("")
                                                            setNewUrl("")
                                                        }}
                                                        className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                                                        disabled={createMutation.isPending}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={!newTitle.trim() || !newUrl.trim() || createMutation.isPending || !restaurantId}
                                                        className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                                                    >
                                                        {createMutation.isPending ? "Adding..." : "Add Link"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </>
                                :
                                <>
                                    <Button
                                        size="lg"
                                        onClick={() => {
                                            const plan = prismaUser?.subscription_plan ?? "basic"
                                            const planName = STRIPE_PLANS[plan].name
                                            const limit = STRIPE_PLANS[plan].limits?.links

                                            openPopup(`You are limited to ${limit} links on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`)
                                        }}
                                        className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add new link
                                    </Button>
                                </>
                        }


                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm">
                        <CardHeader className="font-poppins">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-slate-900">Your Links</CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Select multiple links to perform bulk actions
                                    </CardDescription>
                                </div>
                                {links.length > 0 && (
                                    <Checkbox
                                        checked={selectedLinks.size === links.length}
                                        onCheckedChange={toggleAllLinks}
                                        aria-label="Select all links"
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {links.length > 0 ? (
                                <div className="space-y-3">
                                    {links.map((link, index) => (
                                        <div key={link.id} className="border border-slate-200 rounded-lg  bg-white/80 p-4 backdrop-blur-sm transition-shadow hover:shadow-md">
                                            <div
                                                className="flex items-center gap-3 "
                                            >
                                                <Checkbox
                                                    checked={selectedLinks.has(link.id)}
                                                    onCheckedChange={() => toggleLinkSelection(link.id)}
                                                    aria-label={`Select ${link.title}`}
                                                />
                                                {/* 
                                                <div className="flex-shrink-0 cursor-move">
                                                    <Grip className="h-5 w-5 text-slate-400" />
                                                </div> */}

                                                <div className="min-w-0 flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        {getLucideIconBySlug(link.icon_slug, { className: "w-4 h-4" })}
                                                        <h3 className="truncate font-medium text-slate-900">{link.title}</h3>
                                                    </div>
                                                    <p className="truncate text-sm text-slate-500">{link.url}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-700">Clicks:</span>
                                                    <div className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                                                        {link?._count?.views}
                                                    </div>
                                                </div>

                                                <div className="flex flex-shrink-0 items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(link)}
                                                        className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                                disabled={deleteMutation.isPending}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the link &quot;{link.title}&quot; from{" "}
                                                                    {selectedRestaurant.name}&apos;s page.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="font-poppins rounded-full !px-5">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteMutation.mutate(link.id)}
                                                                    className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => reorderMutation.mutate({ linkId: link.id, direction: "up" })}
                                                        disabled={index === 0 || reorderMutation.isPending}
                                                        className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                        <span className="sr-only">Move up</span>
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => reorderMutation.mutate({ linkId: link.id, direction: "down" })}
                                                        disabled={index === links.length - 1 || reorderMutation.isPending}
                                                        className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                        <span className="sr-only">Move down</span>
                                                    </Button>
                                                </div>
                                            </div>

                                        </div>

                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 text-center"
                                >
                                    <p className="mb-4 text-slate-500">No links added yet for {selectedRestaurant.name}</p>
                                    <Button
                                        onClick={() => setIsAddDialogOpen(true)}
                                        size="lg"
                                        disabled={!restaurantId}
                                        className="bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105 hover:from-teal-700 hover:to-blue-700"
                                    >
                                        Add your first link
                                    </Button>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateLink}>
                        <DialogHeader>
                            <DialogTitle>Edit link</DialogTitle>
                            <DialogDescription>Update the details of your link for {selectedRestaurant.name}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Link Title</Label>
                                <Input id="edit-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-url">URL</Label>
                                <Input id="edit-url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Select
                                    value={selectedIcon}
                                    onValueChange={(val) => setSelectedIcon(val as IconSlug)}
                                >
                                    <SelectTrigger id="icon" className="w-full">
                                        <SelectValue placeholder="Select an icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALL_ICON_SLUGS.map((slug) => (
                                            <SelectItem key={slug} value={slug}>
                                                {getLucideIconBySlug(slug, { className: "w-4 h-4" })}  {slug}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false)
                                    setEditingLink(null)
                                    setNewTitle("")
                                    setNewUrl("")
                                }}
                                className="hover:opacity-75  cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                                disabled={updateMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newTitle.trim() || !newUrl.trim() || updateMutation.isPending}
                                className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                            >
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}


