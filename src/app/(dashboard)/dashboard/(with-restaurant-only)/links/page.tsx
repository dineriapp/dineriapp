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
import { ArrowDown, ArrowUp, Edit, Grip, Plus, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Define types
interface Restaurant {
    id: string
    user_id: string
    name: string
    slug: string
}

interface RestaurantLink {
    id: string
    restaurant_id: string
    title: string
    url: string
    sort_order: number
    created_at: string
}

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

// Dummy data
const dummyRestaurant: Restaurant = {
    id: "2",
    user_id: "dummy-user-2",
    name: "Bistro Delight",
    slug: "bistro-delight",
}

const initialDummyLinks: RestaurantLink[] = [
    {
        id: "1",
        restaurant_id: "2",
        title: "View Our Menu",
        url: "https://example.com/menu",
        sort_order: 0,
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        restaurant_id: "2",
        title: "Make a Reservation",
        url: "https://example.com/reservation",
        sort_order: 1,
        created_at: new Date().toISOString(),
    },
    {
        id: "3",
        restaurant_id: "2",
        title: "Follow us on Instagram",
        url: "https://instagram.com/bistrodelight",
        sort_order: 2,
        created_at: new Date().toISOString(),
    },
    {
        id: "4",
        restaurant_id: "2",
        title: "Get Directions",
        url: "https://maps.google.com",
        sort_order: 3,
        created_at: new Date().toISOString(),
    },
]

export default function LinksPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [links, setLinks] = useState<RestaurantLink[]>([])
    const [newTitle, setNewTitle] = useState("")
    const [newUrl, setNewUrl] = useState("")
    const [editingLink, setEditingLink] = useState<RestaurantLink | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setRestaurant(dummyRestaurant)
            setLinks(initialDummyLinks)
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurant || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const nextOrder = links.length > 0 ? Math.max(...links.map((link) => link.sort_order)) + 1 : 0

            const newLink: RestaurantLink = {
                id: Date.now().toString(), // Simple ID generation for demo
                restaurant_id: restaurant.id,
                title: newTitle.trim(),
                url: newUrl.trim().startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`,
                sort_order: nextOrder,
                created_at: new Date().toISOString(),
            }

            setLinks([...links, newLink])
            setNewTitle("")
            setNewUrl("")
            setIsAddDialogOpen(false)

            toast("Link added successfully")
        } catch {
            toast("Error adding link")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingLink || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const updatedUrl = newUrl.trim().startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`

            setLinks(
                links.map((link) =>
                    link.id === editingLink.id
                        ? {
                            ...link,
                            title: newTitle.trim(),
                            url: updatedUrl,
                        }
                        : link,
                ),
            )

            setIsEditDialogOpen(false)
            setEditingLink(null)

            toast("Link updated successfully")
        } catch {
            toast("Error updating link")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditClick = (link: RestaurantLink) => {
        setEditingLink(link)
        setNewTitle(link.title)
        setNewUrl(link.url)
        setIsEditDialogOpen(true)
    }

    const deleteLink = async (linkId: string) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            setLinks(links.filter((link) => link.id !== linkId))

            toast("Link deleted successfully")
        } catch {
            toast("Error deleting link")
        }
    }

    const moveLink = async (linkId: string, direction: "up" | "down") => {
        const currentIndex = links.findIndex((link) => link.id === linkId)
        if (currentIndex === -1) return

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0 || newIndex >= links.length) return

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 300))

            const updatedLinks = [...links]
            const temp = updatedLinks[currentIndex].sort_order
            updatedLinks[currentIndex].sort_order = updatedLinks[newIndex].sort_order
            updatedLinks[newIndex].sort_order = temp

            updatedLinks.sort((a, b) => a.sort_order - b.sort_order)

            setLinks(updatedLinks)
        } catch {
            toast("Error updating link order")
        }
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

    const deleteSelectedLinks = async () => {
        if (selectedLinks.size === 0) return

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            setLinks(links.filter((link) => !selectedLinks.has(link.id)))
            setSelectedLinks(new Set())
            setIsDeleteDialogOpen(false)

            toast(`Successfully deleted ${selectedLinks.size} link${selectedLinks.size > 1 ? "s" : ""}`)
        } catch {
            toast("Error deleting links")
        }
    }

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="flex items-center space-x-2 text-slate-500">
                    <svg
                        className="animate-spin h-5 w-5 text-teal-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <>

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                            Manage Links
                        </h1>
                        <p className="mt-2 text-slate-500">Add, edit, or remove links from your restaurant page</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedLinks.size > 0 && (
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="lg"
                                        className="flex items-center gap-2 transition-transform hover:scale-105"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Selected ({selectedLinks.size})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete {selectedLinks.size} selected link
                                            {selectedLinks.size > 1 ? "s" : ""}. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={deleteSelectedLinks}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105 hover:from-teal-700 hover:to-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add new link
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleAddLink}>
                                    <DialogHeader>
                                        <DialogTitle>Add new link</DialogTitle>
                                        <DialogDescription>Add a link to your restaurant page</DialogDescription>
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
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!newTitle || !newUrl || isSubmitting}
                                            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                        >
                                            {isSubmitting ? "Adding..." : "Add Link"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm">
                        <CardHeader>
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
                                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                                    {links.map((link, index) => (
                                        <motion.div
                                            key={link.id}
                                            variants={item}
                                            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white/80 p-4 backdrop-blur-sm transition-shadow hover:shadow-md"
                                        >
                                            <Checkbox
                                                checked={selectedLinks.has(link.id)}
                                                onCheckedChange={() => toggleLinkSelection(link.id)}
                                                aria-label={`Select ${link.title}`}
                                            />

                                            <div className="flex-shrink-0 cursor-move">
                                                <Grip className="h-5 w-5 text-slate-400" />
                                            </div>

                                            <div className="min-w-0 flex-grow">
                                                <h3 className="truncate font-medium text-slate-900">{link.title}</h3>
                                                <p className="truncate text-sm text-slate-500">{link.url}</p>
                                            </div>

                                            <div className="flex flex-shrink-0 items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(link)}
                                                    className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive transition-transform hover:scale-110"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the link from your restaurant
                                                                page.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => deleteLink(link.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveLink(link.id, "up")}
                                                    disabled={index === 0}
                                                    className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                >
                                                    <ArrowUp className="h-4 w-4" />
                                                    <span className="sr-only">Move up</span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveLink(link.id, "down")}
                                                    disabled={index === links.length - 1}
                                                    className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                >
                                                    <ArrowDown className="h-4 w-4" />
                                                    <span className="sr-only">Move down</span>
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 text-center"
                                >
                                    <p className="mb-4 text-slate-500">No links added yet</p>
                                    <Button
                                        onClick={() => setIsAddDialogOpen(true)}
                                        size="lg"
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
                            <DialogDescription>Update the details of your link</DialogDescription>
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
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newTitle || !newUrl || isSubmitting}
                                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
