"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { useCreateEvent, useDeleteEvent, useEvents, useReorderEvent, useUpdateEvent } from "@/lib/event-queries"
import { isLimitReached, STRIPE_PLANS } from "@/lib/stripe-plans"
import { useUserStore } from "@/stores/auth-store"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store"
import type { Event, SubscriptionPlan } from "@prisma/client"
import { ArrowDown, ArrowUp, Calendar, Edit, ExternalLink, Plus, Search, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import type React from "react"
import { useState } from "react"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}


export default function EventsPage() {
    const { selectedRestaurant } = useRestaurantStore()
    const restaurantId = selectedRestaurant?.id
    const { prismaUser } = useUserStore()
    const openPopup = useUpgradePopupStore(state => state.open)

    const { data: events = [], isLoading } = useEvents(restaurantId)
    const createEventMutation = useCreateEvent(restaurantId)
    const updateEventMutation = useUpdateEvent(restaurantId)
    const deleteEventMutation = useDeleteEvent(restaurantId)
    const reorderEventMutation = useReorderEvent(restaurantId)

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState("")
    const [ticketUrl, setTicketUrl] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    // Filter events based on search query
    const filteredEvents = events.filter(
        (event) =>
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setDate("")
        setTicketUrl("")
    }

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurantId) return

        try {
            await createEventMutation.mutateAsync({
                title: title.trim(),
                description: description.trim() || undefined,
                date: new Date(date).toISOString(),
                ticket_url: ticketUrl.trim() || undefined,
            })

            resetForm()
            setIsAddDialogOpen(false)
        } catch {
            // Error handling is done in the mutation
        }
    }

    const handleUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingEvent || !restaurantId) return

        try {
            await updateEventMutation.mutateAsync({
                id: editingEvent.id,
                title: title.trim(),
                description: description.trim() || undefined,
                date: new Date(date).toISOString(),
                ticket_url: ticketUrl.trim() || undefined,
            })

            setIsEditDialogOpen(false)
            setEditingEvent(null)
            resetForm()
        } catch {
            // Error handling is done in the mutation
        }
    }

    const handleDeleteEvent = async (eventId: string) => {
        try {
            await deleteEventMutation.mutateAsync(eventId)
        } catch {
            // Error handling is done in the mutation
        }
    }

    const moveEvent = (eventId: string, direction: "up" | "down") => {
        reorderEventMutation.mutate({ eventId, direction })
    }

    const formatEventDate = (dateString: Date) => {
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

    if (isLoading || !restaurantId) {
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

    const isEventsLimitReached = isLimitReached({
        userPlan: prismaUser?.subscription_plan as SubscriptionPlan,
        resourceType: "events",
        currentCount: events.length,
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
                        {isEventsLimitReached ?
                            <>
                                <Button
                                    size="lg"
                                    onClick={() => {
                                        const plan = prismaUser?.subscription_plan ?? "basic";
                                        const limit = STRIPE_PLANS[plan].limits?.events;
                                        const planName = STRIPE_PLANS[plan].name;

                                        if (limit !== undefined && events.length >= limit) {
                                            openPopup(`You are limited to ${limit} events on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`);
                                        } else {
                                        }
                                    }}
                                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Event
                                </Button>
                            </>
                            :
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
                                                disabled={!title || !date || createEventMutation.isPending}
                                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                                            >
                                                {createEventMutation.isPending ? "Adding..." : "Add Event"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        }

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
                                            <div
                                                key={event.id}
                                                className="flex items-center gap-3 rounded-lg border bg-white/80 p-4 backdrop-blur-sm transition-shadow hover:shadow-md"
                                            >
                                                {/* <div className="flex-shrink-0 cursor-move">
                                                    <Grip className="h-5 w-5 text-muted-foreground" />
                                                </div> */}

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
                                                        disabled={index === 0 || reorderEventMutation.isPending}
                                                        className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                        <span className="sr-only">Move up</span>
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveEvent(event.id, "down")}
                                                        disabled={index === filteredEvents.length - 1 || reorderEventMutation.isPending}
                                                        className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                        <span className="sr-only">Move down</span>
                                                    </Button>
                                                </div>
                                            </div>
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
                                disabled={!title || !date || updateEventMutation.isPending}
                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                            >
                                {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
