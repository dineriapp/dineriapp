"use client";

import LoadingUI from "@/components/loading-ui";
import AddEventDialog from "@/components/pages/dashboard/events/add-event-dialog";
import EditEventDialog from "@/components/pages/dashboard/events/edit-event-dialog";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth/auth-client";
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useReorderEvent,
  useUpdateEvent,
} from "@/lib/event-queries";
import { container4 } from "@/lib/reuseable-data";
import { isLimitReached, STRIPE_PLANS } from "@/lib/stripe-plans";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store";
import type { Event, SubscriptionPlan } from "@prisma/client";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Edit,
  ExternalLink,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";

export default function EventsPage() {
  const { selectedRestaurant } = useRestaurantStore();
  const restaurantId = selectedRestaurant?.id;
  const { data: session } = useSession();
  const openPopup = useUpgradePopupStore((state) => state.open);
  const t = useTranslations("events");
  const { data: events = [], isLoading } = useEvents(restaurantId);
  const createEventMutation = useCreateEvent(restaurantId);
  const updateEventMutation = useUpdateEvent(restaurantId);
  const deleteEventMutation = useDeleteEvent(restaurantId);
  const reorderEventMutation = useReorderEvent(restaurantId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter events based on search query
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTicketUrl("");
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    try {
      await createEventMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        ticket_url: ticketUrl.trim() || undefined,
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !restaurantId) return;

    try {
      await updateEventMutation.mutateAsync({
        id: editingEvent.id,
        title: title.trim(),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        ticket_url: ticketUrl.trim() || undefined,
      });

      setIsEditDialogOpen(false);
      setEditingEvent(null);
      resetForm();
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
    } catch {
      // Error handling is done in the mutation
    }
  };

  const moveEvent = (eventId: string, direction: "up" | "down") => {
    reorderEventMutation.mutate({ eventId, direction });
  };

  const formatEventDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const isUpcoming = date > now;

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
    };
  };

  if (isLoading || !restaurantId) {
    return <LoadingUI text={t("loading")} />;
  }

  const isEventsLimitReached = isLimitReached({
    userPlan: session?.user?.subscription_plan as SubscriptionPlan,
    resourceType: "events",
    currentCount: events.length,
  });

  const plan = session?.user?.subscription_plan ?? "basic";

  return (
    <>
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className=" text-4xl font-bold text-main-blue">{t("title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="flex items-center gap-4 max-md:flex-col max-md:w-full ">
            {/* Search */}
            <div className="relative bg-white flex items-center justify-start rounded-full max-md:w-full">
              <Search className="absolute size-5 left-4" />
              <input
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 font-poppins rounded-full md:w-64  w-full h-[42px] border border-gray-300"
              />
            </div>

            {/* Button */}
            {isEventsLimitReached ? (
              <button
                onClick={() =>
                  openPopup(
                    `${t("upgrade_limit_message", {
                      limit: STRIPE_PLANS[plan].limits?.events || "",
                      plan: STRIPE_PLANS[plan].name,
                    })}`,
                  )
                }
                className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins  h-[42px] text-white"
              >
                {t("add_event")}
              </button>
            ) : (
              <AddEventDialog
                open={isAddDialogOpen}
                setOpen={setIsAddDialogOpen}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                date={date}
                setDate={setDate}
                ticketUrl={ticketUrl}
                setTicketUrl={setTicketUrl}
                handleAddEvent={handleAddEvent}
                resetForm={resetForm}
                isPending={createEventMutation.isPending}
              />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{t("your_events")}</CardTitle>
              <CardDescription>
                {t("events_found", { count: filteredEvents.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEvents.length > 0 ? (
                <motion.div
                  variants={container4}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {filteredEvents.map((event, index) => {
                    const { formatted: formattedDate, isUpcoming } =
                      formatEventDate(event.date);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-lg border bg-white/80 p-4 backdrop-blur-sm transition-shadow hover:shadow-md max-md:flex-col"
                      >
                        {/* <div className="flex-shrink-0 cursor-move">
                                                    <Grip className="h-5 w-5 text-muted-foreground" />
                                                </div> */}

                        <div className="min-w-0 flex-grow max-md:w-full ">
                          <div className="flex items-center gap-2 max-md:justify-between">
                            <h3 className="truncate font-medium">
                              {event.title}
                            </h3>
                            {isUpcoming && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                {t("upcoming")}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-teal-600" />
                            <span className="text-sm font-medium text-teal-700">
                              {formattedDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-1">
                          {event.ticket_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0   bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full"
                            >
                              <a
                                href={event.ticket_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View tickets"
                              >
                                <ExternalLink className="h-4 w-4 text-white" />
                                <span className="sr-only">
                                  {t("view_tickets")}
                                </span>
                              </a>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingEvent(event);
                              setTitle(event.title);
                              setDescription(event.description || "");
                              setDate(
                                new Date(event.date).toISOString().slice(0, 16),
                              );
                              setTicketUrl(event.ticket_url || "");
                              setIsEditDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0   bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("edit_event")}</span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0   bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">
                                  {t("delete_event_title")}
                                </span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("delete_event_title")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("delete_event_description", {
                                    title: event.title,
                                  })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-poppins rounded-full !px-5">
                                  {t("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                                >
                                  {t("delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveEvent(event.id, "up")}
                            disabled={
                              index === 0 || reorderEventMutation.isPending
                            }
                            className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                          >
                            <ArrowUp className="h-4 w-4" />
                            <span className="sr-only">{t("move_up")}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveEvent(event.id, "down")}
                            disabled={
                              index === filteredEvents.length - 1 ||
                              reorderEventMutation.isPending
                            }
                            className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                          >
                            <ArrowDown className="h-4 w-4" />
                            <span className="sr-only">{t("move_down")}</span>
                          </Button>
                        </div>
                      </div>
                    );
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
                      <p className="mb-4 text-muted-foreground">
                        {t("no_events_match", { query: searchQuery })}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery("")}
                      >
                        {t("clear_search")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {t("no_events")}
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Edit Event Dialog */}
      <EditEventDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        date={date}
        setDate={setDate}
        ticketUrl={ticketUrl}
        setTicketUrl={setTicketUrl}
        handleUpdateEvent={handleUpdateEvent}
        resetForm={resetForm}
        setEditingEvent={setEditingEvent}
        isPending={updateEventMutation.isPending}
      />
    </>
  );
}
