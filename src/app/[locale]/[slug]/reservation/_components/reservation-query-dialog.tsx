"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getUTCFromLocalDateTime } from "@/lib/date-utils";
import { generateTimeslots } from "@/lib/utils";
import { ReservationFormData, reservationSchema } from "@/lib/validations";
import { toast } from "sonner";

export function ReservationDialog({ restaurantId, timezone = "Europe/Rome", children }: { restaurantId: string, children: ReactNode, timezone: string }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ReservationFormData>({
        resolver: zodResolver(reservationSchema),
        defaultValues: {
            restaurantId: restaurantId,
            date: "",
            time: "",
            name: "",
            email: "",
            message: "",
            phoneNumber: "",
            arival_time: ""
        },
    });


    async function onSubmit(data: ReservationFormData) {
        try {
            setIsSubmitting(true);
            const api_data = { ...data, arival_time: getUTCFromLocalDateTime(new Date(data.date).toISOString().split("T")[0], data.time, timezone) }
            console.log(api_data)
            const response = await fetch("/api/reservations/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(api_data),
            });

            if (!response.ok) {
                throw new Error("Failed to submit reservation query");
            }

            toast("Your reservation query has been submitted successfully.");

            form.reset();
            setOpen(false);
        } catch (error) {
            toast(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Reservation Query</DialogTitle>
                    <DialogDescription>
                        Fill in your details to submit a reservation query. We&apos;ll get back to you soon.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <select
                                            className="border border-input bg-background text-sm rounded-md px-3 py-2 w-full"
                                            value={field.value}
                                            onChange={field.onChange}
                                        >
                                            <option value="">Select time</option>

                                            {generateTimeslots().map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />




                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="your@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 (555) 000-0000" {...field} />
                                    </FormControl>
                                    <FormDescription>Optional</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about your reservation needs..."
                                            className="min-h-[120px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Query"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
