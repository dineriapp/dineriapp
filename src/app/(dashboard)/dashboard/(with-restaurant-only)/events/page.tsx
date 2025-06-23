"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Plus, Grip, Edit, Trash2, ArrowUp, ArrowDown, Calendar, ExternalLink, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { toast } from "sonner"
import { DashboardHeader } from "../../../_components/header"

interface Event {
    id: string
    title: string
    description: string
    date: string
    ticket_url?: string
    sort_order: number
    created_at: string
    updated_at: string
}

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

// Dummy data for events
const initialEvents: Event[] = [
    {
        id: "1",
        title: "Wine Tasting Evening",
        description: "Join us for an exclusive wine tasting featuring premium selections from local vineyards.",
        date: "2024-02-15T19:00:00",
        ticket_url: "https://eventbrite.com/wine-tasting",
        sort_order: 0,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
    },
    {
        id: "2",
        title: "Chef's Table Experience",
        description: "An intimate dining experience with our head chef preparing a 7-course tasting menu.",
        date: "2024-02-22T18:30:00",
        ticket_url: "https://opentable.com/chefs-table",
        sort_order: 1,
        created_at: "2024-01-16T10:00:00Z",
        updated_at: "2024-01-16T10:00:00Z",
    },
    {
        id: "3",
        title: "Live Jazz Night",
        description: "Enjoy smooth jazz music while dining on our signature dishes.",
        date: "2024-03-01T20:00:00",
        sort_order: 2,
        created_at: "2024-01-17T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
    },
    {
        id: "4",
        title: "Valentine's Day Special",
        description: "Romantic dinner for two with special menu and complimentary champagne.",
        date: "2024-02-14T19:30:00",
        ticket_url: "https://resy.com/valentines-special",
        sort_order: 3,
        created_at: "2024-01-18T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z",
    },
]

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>(initialEvents)
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState("")
    const [ticketUrl, setTicketUrl] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    // Filter events based on search query
    const filteredEvents = events.filter(
        (event) =>
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setDate("")
        setTicketUrl("")
    }

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const nextOrder = events.length > 0 ? Math.max(...events.map((event) => event.sort_order)) + 1 : 0

            const eventDate = new Date(date)
            if (isNaN(eventDate.getTime())) {
                throw new Error("Invalid date")
            }

            const newEvent: Event = {
                id: Date.now().toString(),
                title: title.trim(),
                description: description.trim(),
                date: eventDate.toISOString(),
                ticket_url: ticketUrl.trim() || undefined,
                sort_order: nextOrder,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            setEvents([...events, newEvent])
            resetForm()
            setIsAddDialogOpen(false)

            toast.success("Event added successfully!")
        } catch {
            toast.error("Failed to add event")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingEvent || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const eventDate = new Date(date)
            if (isNaN(eventDate.getTime())) {
                throw new Error("Invalid date")
            }

            setEvents(
                events.map((event) =>
                    event.id === editingEvent.id
                        ? {
                            ...event,
                            title: title.trim(),
                            description: description.trim(),
                            date: eventDate.toISOString(),
                            ticket_url: ticketUrl.trim() || undefined,
                            updated_at: new Date().toISOString(),
                        }
                        : event,
                ),
            )

            setIsEditDialogOpen(false)
            setEditingEvent(null)
            resetForm()

            toast.success("Event updated successfully!")
        } catch {
            toast.error("Failed to update event")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteEvent = async (eventId: string) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            setEvents(events.filter((event) => event.id !== eventId))
            toast.success("Event deleted successfully!")
        } catch {
            toast.error("Failed to delete event")
        }
    }

    const moveEvent = (eventId: string, direction: "up" | "down") => {
        const currentIndex = events.findIndex((event) => event.id === eventId)
        if (currentIndex === -1) return

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
        if (newIndex < 0 || newIndex >= events.length) return

        const newEvents = [...events]
            ;[newEvents[currentIndex], newEvents[newIndex]] = [newEvents[newIndex], newEvents[currentIndex]]

        // Update sort orders
        newEvents[currentIndex].sort_order = currentIndex
        newEvents[newIndex].sort_order = newIndex

        setEvents(newEvents)
        toast.success("Event order updated!")
    }

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const isUpcoming = date > now

        return {
            formatted: date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }),
            isUpcoming,
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <DashboardHeader />
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
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                            Events
                        </h1>
                        <p className="mt-2 text-muted-foreground">Manage your restaurant&apos;s events and ticket links</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <form onSubmit={handleAddEvent}>
                                    <DialogHeader>
                                        <DialogTitle>Add Event</DialogTitle>
                                        <DialogDescription>Create a new event for your restaurant</DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Event Title</Label>
                                            <Input
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. Wine Tasting Night"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Add details about your event"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date & Time</Label>
                                            <Input
                                                id="date"
                                                type="datetime-local"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="ticketUrl">Ticket Link (Optional)</Label>
                                            <Input
                                                id="ticketUrl"
                                                type="url"
                                                value={ticketUrl}
                                                onChange={(e) => setTicketUrl(e.target.value)}
                                                placeholder="https://ticketseller.com/your-event"
                                            />
                                            <p className="text-xs text-muted-foreground">Add a link where customers can buy tickets</p>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsAddDialogOpen(false)
                                                resetForm()
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!title || !date || isSubmitting}
                                            className="bg-gradient-to-r from-teal-600 to-blue-600"
                                        >
                                            {isSubmitting ? "Adding..." : "Add Event"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Your Events</CardTitle>
                            <CardDescription>
                                {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredEvents.length > 0 ? (
                                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                                    {filteredEvents.map((event, index) => {
                                        const { formatted: formattedDate, isUpcoming } = formatEventDate(event.date)

                                        return (
                                            <motion.div
                                                key={event.id}
                                                variants={item}
                                                className="flex items-center gap-3 rounded-lg border bg-white/80 p-4 backdrop-blur-sm transition-shadow hover:shadow-md"
                                            >
                                                <div className="flex-shrink-0 cursor-move">
                                                    <Grip className="h-5 w-5 text-muted-foreground" />
                                                </div>

                                                <div className="min-w-0 flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="truncate font-medium">{event.title}</h3>
                                                        {isUpcoming && (
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                                Upcoming
                                                            </span>
                                                        )}
                                                    </div>
                                                    {event.description && (
                                                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-teal-600" />
                                                        <span className="text-sm font-medium text-teal-700">{formattedDate}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-shrink-0 items-center gap-1">
                                                    {event.ticket_url && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                        >
                                                            <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" title="View tickets">
                                                                <ExternalLink className="h-4 w-4 text-teal-600" />
                                                                <span className="sr-only">View tickets</span>
                                                            </a>
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingEvent(event)
                                                            setTitle(event.title)
                                                            setDescription(event.description || "")
                                                            setDate(new Date(event.date).toISOString().slice(0, 16))
                                                            setTicketUrl(event.ticket_url || "")
                                                            setIsEditDialogOpen(true)
                                                        }}
                                                        className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit event</span>
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-destructive transition-transform hover:scale-110"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete event</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete &quot;{event.title}&quot;. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteEvent(event.id)}
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
                                                        onClick={() => moveEvent(event.id, "up")}
                                                        disabled={index === 0}
                                                        className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                        <span className="sr-only">Move up</span>
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveEvent(event.id, "down")}
                                                        disabled={index === filteredEvents.length - 1}
                                                        className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                        <span className="sr-only">Move down</span>
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 text-center"
                                >
                                    {searchQuery ? (
                                        <>
                                            <p className="mb-4 text-muted-foreground">No events found matching &quot;{searchQuery}&quot;</p>
                                            <Button variant="outline" onClick={() => setSearchQuery("")}>
                                                Clear search
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="mb-4 text-muted-foreground">No events added yet</p>
                                            <Button
                                                onClick={() => setIsAddDialogOpen(true)}
                                                size="lg"
                                                className="bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105"
                                            >
                                                Add your first event
                                            </Button>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            {/* Edit Event Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleUpdateEvent}>
                        <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                            <DialogDescription>Update the event details</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="editTitle">Event Title</Label>
                                <Input id="editTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editDescription">Description</Label>
                                <Textarea
                                    id="editDescription"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editDate">Date & Time</Label>
                                <Input
                                    id="editDate"
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editTicketUrl">Ticket Link (Optional)</Label>
                                <Input
                                    id="editTicketUrl"
                                    type="url"
                                    value={ticketUrl}
                                    onChange={(e) => setTicketUrl(e.target.value)}
                                    placeholder="https://ticketseller.com/your-event"
                                />
                                <p className="text-xs text-muted-foreground">Add a link where customers can buy tickets</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false)
                                    setEditingEvent(null)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!title || !date || isSubmitting}
                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
