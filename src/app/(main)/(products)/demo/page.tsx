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

// ✅ Zod schema for validation
const demoFormSchema = z.object({
    businessName: z.string().min(2, "Business name is required"),
    contactPerson: z.string().min(2, "Contact person is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(5, "Phone number is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    message: z.string().optional(),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

export default function DemoPage() {
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
        alert("Your demo request has been submitted. We’ll contact you soon!");
    };

    return (
        <div className="min-h-screen bg-[#002147] flex flex-col">
            {/* Hero Section */}
            <div className="w-full max-w-[1200px] mx-auto px-4 pt-32 lg:pt-40 text-center">
                <h1 className="mb-4 text-[44px] font-bold leading-[1.05] tracking-tight text-[#002147] md:text-6xl lg:text-6xl">
                    <span className="text-white">
                        Request Your Free Demo <br /> and Get Started Today
                    </span>
                </h1>
                <p className="text-center text-lg md:text-xl text-gray-300 max-w-[800px] mx-auto leading-relaxed">
                    See how our platform can help your restaurant grow. Fill out the form below
                    and we’ll be in touch to schedule your personalized demo.
                </p>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center py-8 lg:py-12 px-4">
                <div className="w-full max-w-2xl bg-[white] box-shad-every shadow-lg rounded-2xl px-5 py-8 md:p-8">
                    <h2 className="text-2xl font-bold text-[#002147] text-center mb-1">
                        Request a Demo
                    </h2>
                    <p className="text-center text-gray-500 text-base mb-8">
                        Fill in your business details and we’ll contact you by phone or email.
                    </p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name</FormLabel>
                                            <FormControl>
                                                <Input className="!h-[50] font-poppins" placeholder="Your restaurant name" {...field} />
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
                                            <FormLabel>Contact Person</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" className="!h-[50] font-poppins" {...field} />
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
                                                <Input type="email" className="!h-[50] font-poppins" placeholder="example@email.com" {...field} />
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
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input type="tel" className="!h-[50] font-poppins" placeholder="+1 234 567 890" {...field} />
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
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" className="!h-[50] font-poppins" {...field} />
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
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City" className="!h-[50] font-poppins" {...field} />
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
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Country" className="!h-[50] font-poppins" {...field} />
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
                                            <FormLabel>Additional Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us more about your business needs..."
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
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
