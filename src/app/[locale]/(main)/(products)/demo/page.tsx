"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";




export default function DemoPage() {

    const t = useTranslations("DemoPage.Form");
    const h = useTranslations("DemoPage.Hero");

    // ✅ Zod schema for validation
    const demoFormSchema = z.object({
        businessName: z.string().min(2, t("fields.businessName.error")),
        contactPerson: z.string().min(2, t("fields.contactPerson.error")),
        email: z.string().email(t("fields.email.error")),
        phone: z.string().min(5, t("fields.phone.error")),
        address: z.string().min(5, t("fields.address.error")),
        city: z.string().min(2, t("fields.city.error")),
        country: z.string().min(2, t("fields.country.error")),
        message: z.string().optional()
    });

    type DemoFormValues = z.infer<typeof demoFormSchema>;

    const form = useForm<DemoFormValues>({
        resolver: zodResolver(demoFormSchema),
        defaultValues: {
            businessName: "",
            contactPerson: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "",
            message: "",
        },
    });

    const onSubmit = (values: DemoFormValues) => {
        console.log("Demo request submitted:", values);
        alert(t("successMessage"));
    };

    return (
        <div className="min-h-screen bg-[#002147] flex flex-col">
            {/* Hero Section */}
            <div className="w-full max-w-[1200px] mx-auto px-4 pt-32 lg:pt-40 text-center">
                <h1
                    dangerouslySetInnerHTML={{ __html: h.raw("title") }}
                    className="mb-4 text-[44px] font-bold leading-[1.05]  tracking-tight text-white md:text-6xl lg:text-6xl">
                </h1>
                <p className="text-center text-lg md:text-xl text-gray-300 max-w-[800px] mx-auto leading-relaxed">
                    {h("description")}
                </p>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center py-8 lg:py-12 px-4">
                <div className="w-full max-w-2xl bg-[white] box-shad-every shadow-lg rounded-2xl px-5 py-8 md:p-8">
                    <h2 className="text-2xl font-bold text-[#002147] text-center mb-1">
                        {t("heading")}
                    </h2>
                    <p className="text-center text-gray-500 text-base mb-8">
                        {t("subheading")}
                    </p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("fields.businessName.label")}</FormLabel>
                                            <FormControl>
                                                <Input className="!h-[50] font-poppins" placeholder={t("fields.businessName.placeholder")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactPerson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("fields.contactPerson.label")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("fields.contactPerson.placeholder")} className="!h-[50] font-poppins" {...field} />
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
                                                <Input type="email" className="!h-[50] font-poppins" placeholder={t("fields.email.placeholder")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("fields.phone.label")}</FormLabel>
                                            <FormControl>
                                                <Input type="tel" className="!h-[50] font-poppins" placeholder={t("fields.phone.placeholder")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>{t("fields.address.label")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("fields.address.placeholder")} className="!h-[50] font-poppins" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("fields.city.label")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("fields.city.placeholder")} className="!h-[50] font-poppins" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("fields.country.label")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("fields.country.placeholder")} className="!h-[50] font-poppins" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>{t("fields.message.label")}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t("fields.message.placeholder")}
                                                    className="resize-none font-poppins pt-3"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-center">

                                <Button type="submit" className="bg-[#009A5E] hover:bg-[#104e37] hover:scale-105 font-poppins h-[62px] transition-transform text-lg px-10 cursor-pointer rounded-full">
                                    {t("submit")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
