"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Restaurant } from "@prisma/client";
import { CalendarDays, CalendarIcon, ChevronDownIcon, Info, Users } from "lucide-react";
import * as React from "react";

interface BookingInterfaceProps {
    restaurant: Restaurant;
}

export default function BookingInterface({ restaurant }: BookingInterfaceProps) {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [open, setOpen] = React.useState(false);
    const [partySize, setPartySize] = React.useState("2");
    const [area, setArea] = React.useState("none");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [reminders, setReminders] = React.useState(true);
    // F9fafb

    // const canPay = Boolean(date && time && partySize && name && email && phone);
    const canPay = true;

    return (
        <div className="px-5">
            <div className="max-w-[1200px] mx-auto py-10">
                {/* Title Row */}
                <div
                    className="mb-5">
                    <h1
                        style={{
                            color: restaurant.textColor
                        }}
                        className="text-2xl font-semibold">{restaurant?.name}</h1>
                    <p
                        style={{
                            color: restaurant.textColor
                        }}
                        className="text-muted-foreground">{restaurant?.bio}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left: Form */}
                    <Card className="lg:col-span-2 shadow-sm gap-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Reservation</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Fill in the details below to secure your table. We’ll hold your reservation after the payment is completed.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">



                            {/* Row: Date / Time / Party Size */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                {/* Date  */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="date-picker" className="px-1">
                                        Date
                                    </Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild className="w-full">
                                            <Button
                                                variant="outline"
                                                id="date-picker"
                                                className="justify-between font-normal w-full"
                                            >
                                                {date ? date.toLocaleDateString() : "Select date"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setDate(date)
                                                    setOpen(false)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {/*start Time  */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="time-picker" className="px-1">
                                        Time
                                    </Label>
                                    <Input
                                        type="time"
                                        id="time-picker"
                                        step="1"
                                        defaultValue="10:30:00"
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </div>
                                {/*end Time  */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="time-picker" className="px-1">
                                        Time
                                    </Label>
                                    <Input
                                        type="time"
                                        id="time-picker"
                                        step="1"
                                        defaultValue="10:30:00"
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Party Size */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> Party Size <span className="text-destructive">*</span></Label>
                                    <Select value={partySize} onValueChange={setPartySize}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }).map((_, i) => {
                                                const v = String(i + 1);
                                                return <SelectItem key={v} value={v}>{v}</SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Preferred Area */}
                                <div className="space-y-2">
                                    <Label>Preferred Area <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                    <Select value={area} onValueChange={setArea}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="No preference" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No preference</SelectItem>
                                            <SelectItem value="main">Main</SelectItem>
                                            <SelectItem value="roof-top">Roof‑top</SelectItem>
                                            <SelectItem value="balcony">Balcony</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Choose your preferred dining area. We’ll do our best to accommodate your preference.</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Your Information */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium">Your Information</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Name <span className="text-destructive">*</span></Label>
                                        <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email <span className="text-destructive">*</span></Label>
                                        <Input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone <span className="text-destructive">*</span></Label>
                                        <Input placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Special Requests</Label>
                                        <Textarea placeholder="Allergies, preferences, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Reminders */}
                            <div className="flex items-start gap-3">
                                <Checkbox id="reminders" checked={reminders} onCheckedChange={(v) => setReminders(Boolean(v))} />
                                <Label htmlFor="reminders" className="leading-5">
                                    Send me reservation reminders
                                    <span className="block text-xs text-muted-foreground">We’ll send you a confirmation email and a reminder 24 hours before your reservation</span>
                                </Label>
                            </div>

                            {/* Deposit Required */}
                            <Alert className="border-amber-300 bg-amber-50/60">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Deposit Required</AlertTitle>
                                <AlertDescription>
                                    A refundable deposit of <span className="font-medium">€10.00</span> is required to secure your reservation.
                                </AlertDescription>
                            </Alert>
                        </CardContent>

                        <CardFooter>
                            <Button disabled={!canPay} className="w-full h-11 text-base">
                                <CalendarDays className="mr-2 h-5 w-5" />
                                Continue to Payment
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Right: Summary */}
                    <Card className="shadow-sm h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle>Reservation Summary</CardTitle>
                            <CardDescription>Fill in your booking details to see your reservation summary</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <CalendarIcon className="h-5 w-5" />
                                <p>Nothing selected yet.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
