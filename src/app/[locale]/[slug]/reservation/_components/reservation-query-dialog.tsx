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
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getUTCFromLocalDateTime } from "@/lib/date-utils";
import { generateTimeslots } from "@/lib/utils";
import { ReservationFormData, reservationSchema } from "@/lib/validations";
import { toast } from "sonner";

export function ReservationDialog({
  restaurantId,
  timezone = "Europe/Rome",
  children,
}: {
  restaurantId: string;
  children: ReactNode;
  timezone: string;
}) {
  const t = useTranslations("makeAReservation.reservationDialog");

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
      arival_time: "",
    },
  });

  async function onSubmit(data: ReservationFormData) {
    try {
      setIsSubmitting(true);

      const api_data = {
        ...data,
        arival_time: getUTCFromLocalDateTime(
          new Date(data.date).toISOString().split("T")[0],
          data.time,
          timezone
        ),
      };

      const response = await fetch("/api/reservations/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(api_data),
      });

      if (!response.ok) {
        throw new Error(t("errors.submitFailed"));
      }

      toast(t("toast.success"));

      form.reset();
      setOpen(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.date.label")}</FormLabel>
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
                  <FormLabel>{t("fields.time.label")}</FormLabel>
                  <FormControl>
                    <select
                      className="border border-input bg-background text-sm rounded-md px-3 py-2 w-full"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="">{t("fields.time.placeholder")}</option>

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
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.name.placeholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("fields.email.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("fields.email.placeholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("fields.phone.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.phone.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("fields.phone.optional")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.message.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("fields.message.placeholder")}
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
