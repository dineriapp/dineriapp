"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useRestaurantStore } from "@/stores/restaurant-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import kyInstance from "@/lib/ky"; // adjust path to where you placed kyInstance
import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";

// ---- types ----
type ApiResponse = {
    ok: boolean;
    message?: string;
};

// ---- form ----
const formSchema = z.object({
    sendTo: z.string().email("Enter a valid email address"),
    restaurant_name: z.string().min(1, "Restaurant name is required"),
    guest_name: z.string().min(1, "Guest name is required"),
    party_size: z.coerce.number().int("Must be a whole number").min(1, "Must be at least 1"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    restaurant_contact: z.string().min(1, "Restaurant contact is required"),
});

type FormValues = z.infer<typeof formSchema>;

type TestTemplatesPayload = FormValues & {
    restaurant_id?: string;
};

const TestTemplatesDialog = () => {
    const { selectedRestaurant: restaurant } = useRestaurantStore();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sendTo: "",
            restaurant_name: "Demo Restaurant",
            guest_name: "Alex",
            party_size: 2,
            date: "2026-01-20",
            time: "19:30",
            restaurant_contact: "+1 (555) 123-4567",
        },
        mode: "onSubmit",
    });

    const testTemplatesMutation = useMutation({
        mutationFn: async (payload: TestTemplatesPayload) => {
            const res = await kyInstance
                .post("/api/notifications/test-templates", { json: payload })
                .json<ApiResponse>();

            if (!res.ok) {
                throw new Error(res.message || "Request failed");
            }
            return res;
        },
        onSuccess: (res) => {
            console.log("TEST TEMPLATES SUCCESS:", res);
        },
        onError: async (err: any) => {
            // Ky HTTPError
            if (err?.name === "HTTPError" && err?.response) {
                try {
                    const data = (await err.response.json()) as ApiResponse;
                    console.log("TEST TEMPLATES ERROR:", data);
                    return;
                } catch {
                    console.log(`Request failed (${err.response.status})`);
                    return;
                }
            }
            console.log(err?.message || "Something went wrong");
        },
    });

    const onSubmit = (values: FormValues) => {
        const payload: TestTemplatesPayload = {
            ...values,
            restaurant_id: restaurant?.id,
        };

        testTemplatesMutation.mutate(payload);
    };

    const loading = isSubmitting || testTemplatesMutation.isPending;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">Test your templates</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px] max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Test your templates</DialogTitle>
                    <DialogDescription>
                        Enter sample values and submit to test your email variables.
                    </DialogDescription>
                </DialogHeader>
                {/* show server response */}
                {
                    testTemplatesMutation.data?.message &&
                    <>
                        {testTemplatesMutation.data?.ok ? (
                            <div className="rounded-lg relative border border-green-200 bg-green-50 p-2 border-l-4 border-l-green-500">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-700" />
                                    <p className="text-sm text-green-800">
                                        {testTemplatesMutation.data?.message}
                                    </p>
                                </div>
                            </div>
                        )
                            : (

                                <div className="rounded-lg relative border border-red-200 bg-red-50 p-2 border-l-4 border-l-red-500">
                                    <div className="flex items-center gap-2">
                                        <X className="h-4 w-4 text-red-700" />
                                        <p className="text-sm text-red-800">
                                            {testTemplatesMutation.data?.message}
                                        </p>
                                    </div>
                                </div>
                            )
                        }
                    </>
                }
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Send to */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Send Test Emails To</label>
                        <input
                            type="email"
                            placeholder="test@example.com"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            {...register("sendTo")}
                        />
                        {errors.sendTo && <p className="text-sm text-red-600">{errors.sendTo.message}</p>}
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-sm font-semibold text-slate-900">Variables</p>

                        <div className="mt-3 grid grid-cols-2 gap-4">
                            {/* restaurant_name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">restaurant_name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    {...register("restaurant_name")}
                                />
                                {errors.restaurant_name && (
                                    <p className="text-sm text-red-600">{errors.restaurant_name.message}</p>
                                )}
                            </div>

                            {/* guest_name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">guest_name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    {...register("guest_name")}
                                />
                                {errors.guest_name && (
                                    <p className="text-sm text-red-600">{errors.guest_name.message}</p>
                                )}
                            </div>

                            {/* party_size */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">party_size</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    {...register("party_size")}
                                />
                                {errors.party_size && (
                                    <p className="text-sm text-red-600">{errors.party_size.message}</p>
                                )}
                            </div>

                            {/* date */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    {...register("date")}
                                />
                                {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}
                            </div>

                            {/* time */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">time</label>
                                <input
                                    type="time"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    {...register("time")}
                                />
                                {errors.time && <p className="text-sm text-red-600">{errors.time.message}</p>}
                            </div>

                            {/* restaurant_contact */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">restaurant_contact</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    {...register("restaurant_contact")}
                                />
                                {errors.restaurant_contact && (
                                    <p className="text-sm text-red-600">{errors.restaurant_contact.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                            disabled={loading}
                        >
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Test"}
                        </Button>
                    </div>


                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TestTemplatesDialog;
