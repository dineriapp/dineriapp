// "use client";
// import { AlertCircle, CheckCircle2, Clock, Loader, MapPin } from "lucide-react";

// import {
//   DynamicRule,
//   OverridesSettings,
//   SettingsState,
//   TimeSlotOverride,
// } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types";
// import LoadingUI from "@/components/loading-ui";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import { Textarea } from "@/components/ui/textarea";
// import { useAreas } from "@/lib/area-queries";
// import { getUTCFromLocalDateTime } from "@/lib/date-utils";
// import { OpeningHoursData } from "@/types";
// import { ReservationPolicy, Restaurant } from "@prisma/client";
// import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
// import DailyCapacityWidget from "./daily-capacity-widget";
// import ReservationPoliciesDialog from "./reservation-policies-dialog";
// import { ReservationDialog } from "./reservation-query-dialog";

// // Format time slots for dropdown (30-min intervals)
// const fmt = new Intl.DateTimeFormat("en-US", {
//   hour: "2-digit",
//   minute: "2-digit",
//   hour12: true,
// });

// const timeSlots = Array.from({ length: 48 }, (_, i) => {
//   const date = new Date();
//   date.setHours(Math.floor(i / 2), i % 2 === 0 ? 0 : 30, 0, 0);
//   const str = fmt.format(date);
//   return { value: str, label: str };
// });

// const BookingInterface = ({
//   restaurant,
// }: {
//   restaurant: Restaurant & {
//     reservation_settings: { settings: SettingsState };
//     Reservation_policy: ReservationPolicy | null;
//   };
// }) => {
//   const { data: areas = [], isLoading } = useAreas(restaurant?.id);

//   const settings = restaurant?.reservation_settings?.settings as
//     | SettingsState
//     | undefined;

//   const overrides_settings = useMemo<OverridesSettings>(() => {
//     return (
//       restaurant?.reservation_settings?.settings?.overrides_settings || {
//         overrides_enabled: false,
//         overrides: [],
//       }
//     );
//   }, [restaurant]);

//   const openingHours = useMemo(() => {
//     return restaurant.opening_hours
//       ? (restaurant.opening_hours as OpeningHoursData)
//       : {
//           friday: { open: "", close: "", closed: true },
//           monday: { open: "08:00 AM", close: "04:30 PM", closed: false },
//           sunday: { open: "09:00 AM", close: "08:00 PM", closed: false },
//           tuesday: { open: "06:00 AM", close: "09:00 PM", closed: false },
//           saturday: { open: "06:00 AM", close: "07:00 PM", closed: false },
//           thursday: { open: "06:00 AM", close: "06:00 PM", closed: false },
//           wednesday: { open: "", close: "", closed: true },
//         };
//   }, [restaurant.opening_hours]);

//   // --- State ---
//   const [date, setDate] = useState<Date | undefined>();
//   const [partySize, setPartySize] = useState("2");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [area, setArea] = useState("none");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [notes, setNotes] = useState("");
//   const [openTimes, setOpenTimes] = useState<{
//     open?: string;
//     close?: string;
//     closed?: boolean;
//   }>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [canCreateReservation, setCanCreateReservation] = useState<
//     boolean | null
//   >(true);
//   // Time conversion helper function
//   const timeToMinutes = (timeStr: string): number => {
//     const [time, period] = timeStr.split(" ");
//     const [hours, minutes] = time.split(":").map(Number);
//     let totalMinutes = (hours % 12) * 60 + minutes;
//     if (period === "PM") totalMinutes += 12 * 60;
//     return totalMinutes;
//   };
//   const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

//   // Check for time overrides
//   const checkTimeOverride = (): {
//     isBlocked: boolean;
//     override?: TimeSlotOverride;
//   } => {
//     if (!overrides_settings.overrides_enabled) {
//       return { isBlocked: false };
//     }

//     if (!date || !selectedTime) {
//       return { isBlocked: false };
//     }

//     const selectedDateStr = date.toISOString().split("T")[0];
//     const selectedMinutes = timeToMinutes(selectedTime);

//     for (const override of overrides_settings.overrides) {
//       if (override.date === selectedDateStr && override.blocked) {
//         const startMinutes = timeToMinutes(override.startTime);
//         const endMinutes = timeToMinutes(override.endTime);

//         if (selectedMinutes >= startMinutes && selectedMinutes <= endMinutes) {
//           return { isBlocked: true, override };
//         }
//       }
//     }

//     return { isBlocked: false };
//   };

//   // Check if there are any overrides for the selected date
//   const checkDateOverrides = (): {
//     hasOverrides: boolean;
//     overrides: TimeSlotOverride[];
//   } => {
//     if (!overrides_settings.overrides_enabled || !date) {
//       return { hasOverrides: false, overrides: [] };
//     }

//     const selectedDateStr = date.toISOString().split("T")[0];
//     const dateOverrides = overrides_settings.overrides.filter(
//       (override) => override.date === selectedDateStr && override.blocked
//     );

//     return {
//       hasOverrides: dateOverrides.length > 0,
//       overrides: dateOverrides,
//     };
//   };

//   const { isBlocked: isTimeBlocked, override: activeOverride } =
//     checkTimeOverride();
//   const { hasOverrides: hasDateOverrides, overrides: dateOverrides } =
//     checkDateOverrides();

//   // Deposit calculation for display
//   const calculateDepositForDisplay = (): {
//     amount: number;
//     appliedRule?: DynamicRule;
//   } => {
//     if (!settings?.deposit_settings?.depositSystemEnabled) {
//       return { amount: 0 };
//     }

//     const baseDepositAmount = parseFloat(
//       settings.deposit_settings.depositAmount || "0"
//     );
//     const partySizeNum = parseInt(partySize, 10);
//     const dynamicRules = settings.deposit_settings.dynamicRules || [];

//     const applicableRules: DynamicRule[] = [];

//     dynamicRules.forEach((rule: DynamicRule) => {
//       let isApplicable = false;

//       switch (rule.ruleType) {
//         case "special-date":
//           if (date && rule.date) {
//             const ruleDate = new Date(rule.date);
//             const selectedDate = new Date(date);
//             isApplicable =
//               ruleDate.toDateString() === selectedDate.toDateString();
//           }
//           break;

//         case "time-slot":
//           if (selectedTime && rule.startTime && rule.endTime) {
//             const depositTimeToMinutes = (timeStr: string) => {
//               const [time, period] = timeStr.split(" ");
//               const [hours, minutes] = time.split(":").map(Number);
//               let totalMinutes = (hours % 12) * 60 + minutes;
//               if (period === "PM") totalMinutes += 12 * 60;
//               return totalMinutes;
//             };

//             const selectedMinutes = depositTimeToMinutes(selectedTime);
//             const startMinutes = depositTimeToMinutes(rule.startTime);
//             const endMinutes = depositTimeToMinutes(rule.endTime);

//             isApplicable =
//               selectedMinutes >= startMinutes && selectedMinutes <= endMinutes;
//           }
//           break;

//         case "party-size":
//           if (rule.minPartySize && rule.maxPartySize) {
//             const min = parseInt(rule.minPartySize);
//             const max = parseInt(rule.maxPartySize);
//             isApplicable = partySizeNum >= min && partySizeNum <= max;
//           }
//           break;

//         case "day-of-week":
//           if (date && rule.days) {
//             const dayOfWeek = date.getDay();
//             const ruleDays = rule.days
//               .split(",")
//               .map((d) => parseInt(d.trim()));
//             isApplicable = ruleDays.includes(dayOfWeek);
//           }
//           break;
//       }

//       if (isApplicable) {
//         applicableRules.push(rule);
//       }
//     });

//     applicableRules.sort((a, b) => parseInt(b.priority) - parseInt(a.priority));

//     let finalAmount = 0;
//     let appliedRule: DynamicRule | undefined;

//     if (applicableRules.length > 0) {
//       appliedRule = applicableRules[0];
//       const ruleAmount = parseFloat(appliedRule.amount || "0");

//       if (appliedRule.depositType === "per-person") {
//         finalAmount = ruleAmount * partySizeNum;
//       } else {
//         finalAmount = ruleAmount;
//       }
//     } else {
//       if (settings.deposit_settings.depositType === "per-person") {
//         finalAmount = baseDepositAmount * partySizeNum;
//       } else {
//         finalAmount = baseDepositAmount;
//       }
//     }

//     return { amount: finalAmount, appliedRule };
//   };

//   const { amount: displayDepositAmount, appliedRule: displayAppliedRule } =
//     calculateDepositForDisplay();

//   // Determine open/close for selected date
//   useEffect(() => {
//     if (!date) return;
//     const clientDay = date
//       .toLocaleDateString("en-US", { weekday: "long" })
//       .toLowerCase();
//     const dayStatus = openingHours[clientDay as keyof OpeningHoursData];
//     setOpenTimes(dayStatus);
//   }, [date, openingHours]);

//   // Memoize available times
//   const availableTimeSlots = useMemo(() => {
//     if (!openTimes || openTimes.closed) return [];
//     const openIndex = timeSlots.findIndex((t) => t.value === openTimes.open);
//     const closeIndex = timeSlots.findIndex((t) => t.value === openTimes.close);
//     if (openIndex === -1 || closeIndex === -1) return timeSlots;

//     let availableSlots = timeSlots.slice(openIndex, closeIndex + 1);

//     if (overrides_settings.overrides_enabled && date) {
//       const selectedDateStr = date.toISOString().split("T")[0];

//       availableSlots = availableSlots.filter((slot) => {
//         const slotMinutes = timeToMinutes(slot.value);

//         const isBlocked = overrides_settings.overrides.some((override) => {
//           if (override.date === selectedDateStr && override.blocked) {
//             const startMinutes = timeToMinutes(override.startTime);
//             const endMinutes = timeToMinutes(override.endTime);
//             return slotMinutes >= startMinutes && slotMinutes <= endMinutes;
//           }
//           return false;
//         });

//         return !isBlocked;
//       });
//     }

//     return availableSlots;
//   }, [openTimes, date, overrides_settings]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     // Strict validation
//     if (!date || !selectedTime || !name || !email) {
//       setError("Please fill in all required fields");
//       setIsSubmitting(false);
//       return;
//     }

//     if (isTimeBlocked) {
//       setError(
//         "This time slot is currently unavailable. Please select a different time."
//       );
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const reservationData = {
//         restaurantId: restaurant.id,
//         customer_name: name,
//         customer_email: email,
//         customer_phone: phone,
//         arrival_time: getUTCFromLocalDateTime(
//           date.toISOString().split("T")[0],
//           selectedTime,
//           restaurant.timezone || "Europe/Rome"
//         ),
//         party_size: parseInt(partySize, 10),
//         special_requests: notes,
//         preferred_area: area !== "none" ? area : undefined,
//         success_url: `${window.location.origin}/reservation/success`,
//         cancel_url: `${window.location.origin}/reservation/cancel`,
//       };

//       const response = await fetch("/api/reservations/by-user", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(reservationData),
//       });

//       const result = await response.json();

//       if (result.success) {
//         if (result.checkout_url) {
//           // Redirect to Stripe checkout for payment
//           window.location.href = result.checkout_url;
//         } else {
//           // No deposit required, reservation confirmed immediately
//           toast.success("Reservation created successfully!");
//           // Reset form
//           setDate(undefined);
//           setSelectedTime("");
//           setPartySize("2");
//           setArea("none");
//           setName("");
//           setEmail("");
//           setPhone("");
//           setNotes("");
//         }
//       } else {
//         setError(result.error || "Failed to create reservation");
//       }
//     } catch (error) {
//       console.error("Reservation error:", error);
//       setError("Failed to create reservation. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!restaurant || isLoading) return <LoadingUI text="Loading..." />;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-5 w-full relative">
//       <div className="max-w-7xl w-full mx-auto">
//         <div className="max-w-6xl mx-auto">
//           <form
//             onSubmit={handleSubmit}
//             className="grid grid-cols-1 lg:grid-cols-3 gap-6"
//           >
//             {/* Main Form */}
//             <div className="lg:col-span-2">
//               <Card className="p-5 shadow-lg relative overflow-hidden">
//                 {loading && (
//                   <div className="w-full h-full flex gap-1 items-center justify-center absolute flex-col top-0 left-0 bg-white/70 z-[10]">
//                     <Loader className="size-8 animate-spin" />
//                     Checking availability...
//                   </div>
//                 )}
//                 <div className="space-y-3">
//                   <div className="text-start">
//                     <h1 className="text-2xl font-bold text-gray-900">
//                       Make a Reservation
//                     </h1>
//                     <p className="text-gray-600 text-sm">
//                       Book your table at {restaurant.name}
//                     </p>
//                   </div>
//                   {!canCreateReservation && (
//                     <div className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-md">
//                       <p className="text-sm font-medium">
//                         Not finding the time or option you&apos;re looking for?
//                       </p>
//                       <p className="text-xs mt-0.5">
//                         You can send us your preferred time or any questions.
//                       </p>

//                       <ReservationDialog
//                         restaurantId={restaurant.id}
//                         timezone={restaurant.timezone || ""}
//                       >
//                         <button className="mt-2 cursor-pointer text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-800 text-white hover:bg-slate-900 transition">
//                           Drop Reservation Query
//                         </button>
//                       </ReservationDialog>
//                     </div>
//                   )}

//                   {/* Error Message */}
//                   {error && (
//                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                       <div className="flex items-center gap-2 text-red-700">
//                         <AlertCircle className="h-4 w-4" />
//                         <span className="text-sm font-medium">{error}</span>
//                       </div>
//                     </div>
//                   )}

//                   {/* Date & Time Section */}
//                   <div className="space-y-2">
//                     <div className="grid gap-4 sm:grid-cols-2">
//                       {/* Date */}
//                       <div className="space-y-2">
//                         <Label
//                           htmlFor="date"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Date *
//                         </Label>
//                         <Input
//                           id="date"
//                           type="date"
//                           value={date ? date.toISOString().split("T")[0] : ""}
//                           onChange={(e) => {
//                             const selectedDate = e.target.value
//                               ? new Date(e.target.value)
//                               : undefined;
//                             setDate(selectedDate);
//                             setSelectedTime("");
//                           }}
//                           required
//                           min={new Date().toISOString().split("T")[0]}
//                           className="w-full"
//                         />
//                         {date &&
//                           (openTimes.closed ? (
//                             <p className="text-red-500 text-xs mt-1">
//                               Restaurant is closed on this day.
//                             </p>
//                           ) : (
//                             openTimes.open &&
//                             openTimes.close && (
//                               <p className="text-green-600 text-xs mt-1">
//                                 Open from {openTimes.open} till{" "}
//                                 {openTimes.close}
//                               </p>
//                             )
//                           ))}
//                       </div>

//                       {/* Time */}
//                       <div className="space-y-2">
//                         <Label
//                           htmlFor="time"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Time *
//                         </Label>
//                         <Select
//                           value={selectedTime}
//                           onValueChange={setSelectedTime}
//                           disabled={!date || openTimes.closed}
//                           required
//                         >
//                           <SelectTrigger id="time" className="w-full">
//                             <SelectValue
//                               placeholder={
//                                 !date
//                                   ? "Select date first"
//                                   : openTimes.closed
//                                   ? "Closed"
//                                   : "Select time"
//                               }
//                             />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {availableTimeSlots.map((slot) => (
//                               <SelectItem key={slot.value} value={slot.value}>
//                                 {slot.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>

//                         {isTimeBlocked && activeOverride && (
//                           <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
//                             <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
//                             <div className="flex-1">
//                               <p className="text-red-700 text-xs font-medium">
//                                 This time slot is unavailable
//                               </p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Date Override Info */}
//                     {date && !selectedTime && hasDateOverrides && (
//                       <div className="p-3 border border-amber-200 rounded-md bg-amber-50/40">
//                         <div className="flex items-start gap-2 mb-2">
//                           <AlertCircle className="h-4 w-4 text-amber-700 mt-0.5" />
//                           <div>
//                             <p className="text-sm font-semibold text-amber-800">
//                               Limited Availability
//                             </p>
//                             <p className="text-xs text-amber-700 mt-0.5">
//                               Some time slots may not be available on this date.
//                             </p>
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           {dateOverrides.map((override, index) => (
//                             <div key={override.id} className="pb-2">
//                               <div className="flex flex-col items-start gap-0.5">
//                                 <span className="text-sm font-medium text-slate-700">
//                                   ⏰ {override.startTime} – {override.endTime}
//                                 </span>

//                                 {override.reason && (
//                                   <span className="text-xs italic text-slate-600">
//                                     {override.reason}
//                                   </span>
//                                 )}
//                               </div>

//                               {/* Divider */}
//                               {index < dateOverrides.length - 1 && (
//                                 <div className="border-t border-slate-200 mt-2" />
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <Separator />

//                   {/* Party Details */}
//                   <div className="space-y-2">
//                     <div className="grid gap-4 sm:grid-cols-2">
//                       <div className="space-y-2">
//                         <Label
//                           htmlFor="party-size"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Party Size *
//                         </Label>
//                         <Select
//                           value={partySize}
//                           onValueChange={setPartySize}
//                           required
//                         >
//                           <SelectTrigger id="party-size" className="w-full">
//                             <SelectValue placeholder="Select party size" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {Array.from({ length: 20 }).map((_, i) => (
//                               <SelectItem key={i + 1} value={String(i + 1)}>
//                                 {i + 1} {i === 0 ? "person" : "people"}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="space-y-2">
//                         <Label
//                           htmlFor="area"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Preferred Area
//                         </Label>
//                         <Select value={area} onValueChange={setArea}>
//                           <SelectTrigger id="area" className="w-full">
//                             <SelectValue placeholder="No preference" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="none">No preference</SelectItem>
//                             {areas
//                               ?.filter((a) => a.active)
//                               .map((a) => (
//                                 <SelectItem key={a.id} value={a.id}>
//                                   {a.name}
//                                 </SelectItem>
//                               ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>

//                     {/* Capacity Widget */}
//                     {date && selectedTime && (
//                       <div className="mt-4">
//                         <DailyCapacityWidget
//                           restaurantId={restaurant?.id}
//                           date={getUTCFromLocalDateTime(
//                             date.toISOString().split("T")[0],
//                             selectedTime,
//                             restaurant.timezone || "Europe/Rome"
//                           )}
//                           partySize={Number(partySize)}
//                           onLoadingChange={(isLoading) => setLoading(isLoading)}
//                           onAvailabilityChange={(value) =>
//                             setCanCreateReservation(value)
//                           }
//                         />
//                       </div>
//                     )}
//                   </div>

//                   <Separator />

//                   {/* Contact Information */}
//                   <div className="space-y-2">
//                     <div className="grid gap-4 sm:grid-cols-2">
//                       <div className="space-y-2">
//                         <Label
//                           htmlFor="name"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Full Name *
//                         </Label>
//                         <Input
//                           id="name"
//                           value={name}
//                           onChange={(e) => setName(e.target.value)}
//                           required
//                           placeholder="John Doe"
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label
//                           htmlFor="email"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Email Address *
//                         </Label>
//                         <Input
//                           id="email"
//                           type="email"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           required
//                           placeholder="john@example.com"
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="space-y-2 sm:col-span-2">
//                         <Label
//                           htmlFor="phone"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Phone Number
//                         </Label>
//                         <Input
//                           id="phone"
//                           value={phone}
//                           onChange={(e) => setPhone(e.target.value)}
//                           placeholder="(555) 123-4567"
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="space-y-2 sm:col-span-2">
//                         <Label
//                           htmlFor="notes"
//                           className="text-sm font-medium text-gray-700"
//                         >
//                           Special Requests
//                         </Label>
//                         <Textarea
//                           id="notes"
//                           value={notes}
//                           onChange={(e) => setNotes(e.target.value)}
//                           placeholder="Allergies, dietary restrictions, celebrations, etc."
//                           rows={3}
//                           className="w-full"
//                         />
//                       </div>
//                       <div className="space-y-2 sm:col-span-2">
//                         {/* Checkbox row */}
//                         <label className="flex items-start gap-2 text-sm text-slate-700">
//                           <input
//                             type="checkbox"
//                             className="mt-1 h-4 w-4 rounded border-slate-300"
//                           />
//                           <span>I agree to the reservation policies. </span>
//                         </label>

//                         {/* Button under checkbox */}
//                         {restaurant?.Reservation_policy && (
//                           <ReservationPoliciesDialog
//                             policies={restaurant.Reservation_policy}
//                           >
//                             <span className="text-blue-500 underline cursor-pointer">
//                               {""}Click here to view policies
//                             </span>
//                           </ReservationPoliciesDialog>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </div>

//             {/* Summary Sidebar */}
//             <div className="lg:col-span-1">
//               <Card className="p-5 shadow-lg gap-0 sticky top-20">
//                 <h3 className="text-xl mb-3 font-bold text-gray-900 pb-2 border-b">
//                   Reservation Summary
//                 </h3>

//                 {/* Restaurant Info */}
//                 <div className="space-y-3 relative">
//                   <div className="flex items-start gap-3">
//                     <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                       <MapPin className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900">
//                         {restaurant.name}
//                       </h4>
//                       <p className="text-sm text-gray-600 mt-1">
//                         {restaurant.address}
//                       </p>
//                     </div>
//                   </div>
//                   <p className="inline-flex top-3 right-3 items-center gap-1 px-2 py-0.5 text-[13px] font-medium bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
//                     <Clock className="h-4 w-4 text-blue-600" />
//                     {restaurant?.timezone}
//                   </p>

//                   {/* Reservation Details */}
//                   {(date || selectedTime || partySize !== "2") && (
//                     <div className="space-y-3 pt-4 border-t">
//                       <h4 className="font-semibold text-gray-900">
//                         Your Reservation
//                       </h4>

//                       {date && (
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm text-gray-600">Date:</span>
//                           <span className="text-sm font-medium text-gray-900">
//                             {date.toLocaleDateString("en-US", {
//                               weekday: "long",
//                               year: "numeric",
//                               month: "long",
//                               day: "numeric",
//                             })}
//                           </span>
//                         </div>
//                       )}

//                       {selectedTime && (
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm text-gray-600">Time:</span>
//                           <span className="text-sm font-medium text-gray-900">
//                             {selectedTime}
//                           </span>
//                         </div>
//                       )}

//                       {partySize && (
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm text-gray-600">Guests:</span>
//                           <span className="text-sm font-medium text-gray-900">
//                             {partySize}{" "}
//                             {parseInt(partySize) === 1 ? "person" : "people"}
//                           </span>
//                         </div>
//                       )}

//                       {area !== "none" && (
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm text-gray-600">
//                             Preferred Area:
//                           </span>
//                           <span className="text-sm font-medium text-gray-900">
//                             {areas.find((a) => a.id === area)?.name}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Deposit Information */}
//                   {displayDepositAmount > 0 && (
//                     <div className="pt-4 border-t">
//                       <div className="flex justify-between items-center mb-1">
//                         <span className="text-sm font-medium text-gray-700">
//                           Deposit Required:
//                         </span>
//                         <span className="text-lg font-bold text-blue-600">
//                           {displayDepositAmount}{" "}
//                           {settings?.deposit_settings?.depositCurrency || "EUR"}
//                         </span>
//                       </div>
//                       {displayAppliedRule && (
//                         <div className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-md mb-3">
//                           {getRuleDescription(displayAppliedRule)}
//                         </div>
//                       )}

//                       <p className="text-xs text-gray-500">
//                         This deposit will be applied to your final bill and is
//                         refundable according to our cancellation policy.
//                       </p>
//                     </div>
//                   )}

//                   {/* Policies */}
//                   {settings && (
//                     <>
//                       {settings?.deposit_settings?.cancellationPolicies
//                         ?.length > 0 && (
//                         <div className="pt-4 border-t">
//                           <h4 className="font-semibold text-gray-900 mb-3">
//                             Cancellation Policies
//                           </h4>
//                           <div className="space-y-2 text-sm text-gray-600">
//                             {settings.deposit_settings.cancellationPolicies
//                               .filter((policy: any) => policy.active)
//                               .map((policy: any) => (
//                                 <div
//                                   key={`${Math.random()}-${Math.random()}`}
//                                   className="flex items-start gap-2"
//                                 >
//                                   <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
//                                   Cancel within {policy.hoursBefore} hours for{" "}
//                                   {policy.refundPercentage}% refund
//                                 </div>
//                               ))}
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}
//                   {/* Submit Button  */}
//                   {/* Submit Button */}
//                   <button
//                     type="submit"
//                     disabled={
//                       isSubmitting ||
//                       !date ||
//                       !selectedTime ||
//                       !name ||
//                       !email ||
//                       isTimeBlocked ||
//                       !canCreateReservation ||
//                       loading ||
//                       !phoneRegex.test(phone)
//                     }
//                     className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
//                   >
//                     {isSubmitting ? (
//                       <span className="flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                         {displayDepositAmount > 0
//                           ? "Processing..."
//                           : "Creating Reservation..."}
//                       </span>
//                     ) : isTimeBlocked ? (
//                       "Time Slot Unavailable"
//                     ) : (
//                       `Complete Reservation ${
//                         displayDepositAmount > 0 ? "& Pay Deposit" : ""
//                       }`
//                     )}
//                   </button>
//                   {/* Help Text */}
//                   <div className="pt-4 border-t">
//                     <p className="text-xs text-gray-500">
//                       Need to make changes? Contact us at{" "}
//                       {restaurant.phone || "the restaurant directly"}.
//                     </p>
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper function to generate rule descriptions
// function getRuleDescription(rule: DynamicRule): string {
//   const amount = parseFloat(rule.amount);

//   switch (rule.ruleType) {
//     case "special-date":
//       return `Special date rate: ${
//         rule.depositType === "per-person"
//           ? `€${amount} per person`
//           : `€${amount} flat rate`
//       }`;

//     case "time-slot":
//       return `Time slot rate (${rule.startTime}-${rule.endTime}): ${
//         rule.depositType === "per-person"
//           ? `€${amount} per person`
//           : `€${amount} flat rate`
//       }`;

//     case "party-size":
//       return `Party size rate (${rule.minPartySize}-${
//         rule.maxPartySize
//       } people): ${
//         rule.depositType === "per-person"
//           ? `€${amount} per person`
//           : `€${amount} flat rate`
//       }`;

//     case "day-of-week":
//       const daysMap: { [key: string]: string } = {
//         "0": "Sunday",
//         "1": "Monday",
//         "2": "Tuesday",
//         "3": "Wednesday",
//         "4": "Thursday",
//         "5": "Friday",
//         "6": "Saturday",
//       };
//       const dayNames =
//         rule.days
//           ?.split(",")
//           .map((d) => daysMap[d.trim()])
//           .join(", ") || "";
//       return `${dayNames} rate: ${
//         rule.depositType === "per-person"
//           ? `€${amount} per person`
//           : `€${amount} flat rate`
//       }`;

//     default:
//       return `${
//         rule.depositType === "per-person"
//           ? `€${amount} per person`
//           : `€${amount} flat rate`
//       }`;
//   }
// }

// export default BookingInterface;

//New Code

"use client";
import { AlertCircle, CheckCircle2, Clock, Loader, MapPin } from "lucide-react";

import {
  DynamicRule,
  OverridesSettings,
  SettingsState,
  TimeSlotOverride,
} from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types";
import LoadingUI from "@/components/loading-ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAreas } from "@/lib/area-queries";
import { getUTCFromLocalDateTime } from "@/lib/date-utils";
import { OpeningHoursData } from "@/types";
import { ReservationPolicy, Restaurant } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DailyCapacityWidget from "./daily-capacity-widget";
import ReservationPoliciesDialog from "./reservation-policies-dialog";
import { ReservationDialog } from "./reservation-query-dialog";
import { useTranslations } from "next-intl";

// Format time slots for dropdown (30-min intervals)
const fmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const date = new Date();
  date.setHours(Math.floor(i / 2), i % 2 === 0 ? 0 : 30, 0, 0);
  const str = fmt.format(date);
  return { value: str, label: str };
});

const BookingInterface = ({
  restaurant,
}: {
  restaurant: Restaurant & {
    reservation_settings: { settings: SettingsState };
    Reservation_policy: ReservationPolicy | null;
  };
}) => {
  const t = useTranslations("makeAReservation.booking");

  const { data: areas = [], isLoading } = useAreas(restaurant?.id);

  const settings = restaurant?.reservation_settings?.settings as
    | SettingsState
    | undefined;

  const overrides_settings = useMemo<OverridesSettings>(() => {
    return (
      restaurant?.reservation_settings?.settings?.overrides_settings || {
        overrides_enabled: false,
        overrides: [],
      }
    );
  }, [restaurant]);

  const openingHours = useMemo(() => {
    return restaurant.opening_hours
      ? (restaurant.opening_hours as OpeningHoursData)
      : {
          friday: { open: "", close: "", closed: true },
          monday: { open: "08:00 AM", close: "04:30 PM", closed: false },
          sunday: { open: "09:00 AM", close: "08:00 PM", closed: false },
          tuesday: { open: "06:00 AM", close: "09:00 PM", closed: false },
          saturday: { open: "06:00 AM", close: "07:00 PM", closed: false },
          thursday: { open: "06:00 AM", close: "06:00 PM", closed: false },
          wednesday: { open: "", close: "", closed: true },
        };
  }, [restaurant.opening_hours]);

  // --- State ---
  const [date, setDate] = useState<Date | undefined>();
  const [partySize, setPartySize] = useState("2");
  const [selectedTime, setSelectedTime] = useState("");
  const [area, setArea] = useState("none");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [openTimes, setOpenTimes] = useState<{
    open?: string;
    close?: string;
    closed?: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canCreateReservation, setCanCreateReservation] = useState<
    boolean | null
  >(true);
  // Time conversion helper function
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = (hours % 12) * 60 + minutes;
    if (period === "PM") totalMinutes += 12 * 60;
    return totalMinutes;
  };
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

  // Check for time overrides
  const checkTimeOverride = (): {
    isBlocked: boolean;
    override?: TimeSlotOverride;
  } => {
    if (!overrides_settings.overrides_enabled) {
      return { isBlocked: false };
    }

    if (!date || !selectedTime) {
      return { isBlocked: false };
    }

    const selectedDateStr = date.toISOString().split("T")[0];
    const selectedMinutes = timeToMinutes(selectedTime);

    for (const override of overrides_settings.overrides) {
      if (override.date === selectedDateStr && override.blocked) {
        const startMinutes = timeToMinutes(override.startTime);
        const endMinutes = timeToMinutes(override.endTime);

        if (selectedMinutes >= startMinutes && selectedMinutes <= endMinutes) {
          return { isBlocked: true, override };
        }
      }
    }

    return { isBlocked: false };
  };

  // Check if there are any overrides for the selected date
  const checkDateOverrides = (): {
    hasOverrides: boolean;
    overrides: TimeSlotOverride[];
  } => {
    if (!overrides_settings.overrides_enabled || !date) {
      return { hasOverrides: false, overrides: [] };
    }

    const selectedDateStr = date.toISOString().split("T")[0];
    const dateOverrides = overrides_settings.overrides.filter(
      (override) => override.date === selectedDateStr && override.blocked
    );

    return {
      hasOverrides: dateOverrides.length > 0,
      overrides: dateOverrides,
    };
  };

  const { isBlocked: isTimeBlocked, override: activeOverride } =
    checkTimeOverride();
  const { hasOverrides: hasDateOverrides, overrides: dateOverrides } =
    checkDateOverrides();

  // Deposit calculation for display
  const calculateDepositForDisplay = (): {
    amount: number;
    appliedRule?: DynamicRule;
  } => {
    if (!settings?.deposit_settings?.depositSystemEnabled) {
      return { amount: 0 };
    }

    const baseDepositAmount = parseFloat(
      settings.deposit_settings.depositAmount || "0"
    );
    const partySizeNum = parseInt(partySize, 10);
    const dynamicRules = settings.deposit_settings.dynamicRules || [];

    const applicableRules: DynamicRule[] = [];

    dynamicRules.forEach((rule: DynamicRule) => {
      let isApplicable = false;

      switch (rule.ruleType) {
        case "special-date":
          if (date && rule.date) {
            const ruleDate = new Date(rule.date);
            const selectedDate = new Date(date);
            isApplicable =
              ruleDate.toDateString() === selectedDate.toDateString();
          }
          break;

        case "time-slot":
          if (selectedTime && rule.startTime && rule.endTime) {
            const depositTimeToMinutes = (timeStr: string) => {
              const [time, period] = timeStr.split(" ");
              const [hours, minutes] = time.split(":").map(Number);
              let totalMinutes = (hours % 12) * 60 + minutes;
              if (period === "PM") totalMinutes += 12 * 60;
              return totalMinutes;
            };

            const selectedMinutes = depositTimeToMinutes(selectedTime);
            const startMinutes = depositTimeToMinutes(rule.startTime);
            const endMinutes = depositTimeToMinutes(rule.endTime);

            isApplicable =
              selectedMinutes >= startMinutes && selectedMinutes <= endMinutes;
          }
          break;

        case "party-size":
          if (rule.minPartySize && rule.maxPartySize) {
            const min = parseInt(rule.minPartySize);
            const max = parseInt(rule.maxPartySize);
            isApplicable = partySizeNum >= min && partySizeNum <= max;
          }
          break;

        case "day-of-week":
          if (date && rule.days) {
            const dayOfWeek = date.getDay();
            const ruleDays = rule.days
              .split(",")
              .map((d) => parseInt(d.trim()));
            isApplicable = ruleDays.includes(dayOfWeek);
          }
          break;
      }

      if (isApplicable) {
        applicableRules.push(rule);
      }
    });

    applicableRules.sort((a, b) => parseInt(b.priority) - parseInt(a.priority));

    let finalAmount = 0;
    let appliedRule: DynamicRule | undefined;

    if (applicableRules.length > 0) {
      appliedRule = applicableRules[0];
      const ruleAmount = parseFloat(appliedRule.amount || "0");

      if (appliedRule.depositType === "per-person") {
        finalAmount = ruleAmount * partySizeNum;
      } else {
        finalAmount = ruleAmount;
      }
    } else {
      if (settings.deposit_settings.depositType === "per-person") {
        finalAmount = baseDepositAmount * partySizeNum;
      } else {
        finalAmount = baseDepositAmount;
      }
    }

    return { amount: finalAmount, appliedRule };
  };

  const { amount: displayDepositAmount, appliedRule: displayAppliedRule } =
    calculateDepositForDisplay();

  // Determine open/close for selected date
  useEffect(() => {
    if (!date) return;
    const clientDay = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayStatus = openingHours[clientDay as keyof OpeningHoursData];
    setOpenTimes(dayStatus);
  }, [date, openingHours]);

  // Memoize available times
  const availableTimeSlots = useMemo(() => {
    if (!openTimes || openTimes.closed) return [];
    const openIndex = timeSlots.findIndex((t) => t.value === openTimes.open);
    const closeIndex = timeSlots.findIndex((t) => t.value === openTimes.close);
    if (openIndex === -1 || closeIndex === -1) return timeSlots;

    let availableSlots = timeSlots.slice(openIndex, closeIndex + 1);

    if (overrides_settings.overrides_enabled && date) {
      const selectedDateStr = date.toISOString().split("T")[0];

      availableSlots = availableSlots.filter((slot) => {
        const slotMinutes = timeToMinutes(slot.value);

        const isBlocked = overrides_settings.overrides.some((override) => {
          if (override.date === selectedDateStr && override.blocked) {
            const startMinutes = timeToMinutes(override.startTime);
            const endMinutes = timeToMinutes(override.endTime);
            return slotMinutes >= startMinutes && slotMinutes <= endMinutes;
          }
          return false;
        });

        return !isBlocked;
      });
    }

    return availableSlots;
  }, [openTimes, date, overrides_settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Strict validation
    if (!date || !selectedTime || !name || !email) {
      setError(t("requiredError"));
      setIsSubmitting(false);
      return;
    }

    if (isTimeBlocked) {
      setError(t("timeUnavailable"));
      setIsSubmitting(false);
      return;
    }

    try {
      const reservationData = {
        restaurantId: restaurant.id,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        arrival_time: getUTCFromLocalDateTime(
          date.toISOString().split("T")[0],
          selectedTime,
          restaurant.timezone || "Europe/Rome"
        ),
        party_size: parseInt(partySize, 10),
        special_requests: notes,
        preferred_area: area !== "none" ? area : undefined,
        success_url: `${window.location.origin}/reservation/success`,
        cancel_url: `${window.location.origin}/reservation/cancel`,
      };

      const response = await fetch("/api/reservations/by-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      const result = await response.json();

      if (result.success) {
        if (result.checkout_url) {
          // Redirect to Stripe checkout for payment
          window.location.href = result.checkout_url;
        } else {
          // No deposit required, reservation confirmed immediately
          toast.success(t("reservationSuccess"));
          // toast.success("Reservation created successfully!");
          // Reset form
          setDate(undefined);
          setSelectedTime("");
          setPartySize("2");
          setArea("none");
          setName("");
          setEmail("");
          setPhone("");
          setNotes("");
        }
      } else {
        setError(result.error || t("reservationFailed"));
      }
    } catch (error) {
      console.error("Reservation error:", error);
      setError(t("reservationRetry"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!restaurant || isLoading) return <LoadingUI text={t("loading")} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-5 w-full relative">
      <div className="max-w-7xl w-full mx-auto">
        <div className="max-w-6xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="p-5 shadow-lg relative overflow-hidden">
                {loading && (
                  <div className="w-full h-full flex gap-1 items-center justify-center absolute flex-col top-0 left-0 bg-white/70 z-[10]">
                    <Loader className="size-8 animate-spin" />
                    {t("checkingAvailability")}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="text-start">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {t("makeReservation")}
                    </h1>
                    <p className="text-gray-600 text-sm">
                      {t("bookTableAt", { restaurantName: restaurant.name })}
                    </p>
                  </div>
                  {!canCreateReservation && (
                    <div className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-md">
                      <p className="text-sm font-medium">
                        {t("notFindingOptionTitle")}
                        {/* {t("")} */}
                      </p>
                      <p className="text-xs mt-0.5">
                        {t("notFindingOptionDesc")}
                      </p>

                      <ReservationDialog
                        restaurantId={restaurant.id}
                        timezone={restaurant.timezone || ""}
                      >
                        <button className="mt-2 cursor-pointer text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-800 text-white hover:bg-slate-900 transition">
                          {t("dropReservationQuery")}
                        </button>
                      </ReservationDialog>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Date & Time Section */}
                  <div className="space-y-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Date */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="date"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("date")}
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={date ? date.toISOString().split("T")[0] : ""}
                          onChange={(e) => {
                            const selectedDate = e.target.value
                              ? new Date(e.target.value)
                              : undefined;
                            setDate(selectedDate);
                            setSelectedTime("");
                          }}
                          required
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full"
                        />
                        {date &&
                          (openTimes.closed ? (
                            <p className="text-red-500 text-xs mt-1">
                              {/* Restaurant is closed on this day. */}
                              {t("restaurantClosed")}
                            </p>
                          ) : (
                            openTimes.open &&
                            openTimes.close && (
                              <p className="text-green-600 text-xs mt-1">
                                {/* Open from {openTimes.open} till{" "}
                                {openTimes.close} */}
                                {t("openFrom", {
                                  open: openTimes.open,
                                  close: openTimes.close,
                                })}
                              </p>
                            )
                          ))}
                      </div>

                      {/* Time */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="time"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("time")}
                        </Label>
                        <Select
                          value={selectedTime}
                          onValueChange={setSelectedTime}
                          disabled={!date || openTimes.closed}
                          required
                        >
                          <SelectTrigger id="time" className="w-full">
                            <SelectValue
                              placeholder={
                                !date
                                  ? t("selectDateFirst")
                                  : openTimes.closed
                                  ? t("closed")
                                  : t("selectTime")
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimeSlots.map((slot) => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {isTimeBlocked && activeOverride && (
                          <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-red-700 text-xs font-medium">
                                {/* This time slot is unavailable */}
                                {t("timeSlotUnavailable")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date Override Info */}
                    {date && !selectedTime && hasDateOverrides && (
                      <div className="p-3 border border-amber-200 rounded-md bg-amber-50/40">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-amber-700 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800">
                              {/* Limited Availability */}
                              {t("limitedAvailability")}
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              {t("limitedAvailabilityDesc")}
                              {/* Some time slots may not be available on this date. */}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {dateOverrides.map((override, index) => (
                            <div key={override.id} className="pb-2">
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-medium text-slate-700">
                                  ⏰ {override.startTime} – {override.endTime}
                                </span>

                                {override.reason && (
                                  <span className="text-xs italic text-slate-600">
                                    {override.reason}
                                  </span>
                                )}
                              </div>

                              {/* Divider */}
                              {index < dateOverrides.length - 1 && (
                                <div className="border-t border-slate-200 mt-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Party Details */}
                  <div className="space-y-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="party-size"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("partySize")}
                        </Label>
                        <Select
                          value={partySize}
                          onValueChange={setPartySize}
                          required
                        >
                          <SelectTrigger id="party-size" className="w-full">
                            <SelectValue placeholder={t("selectPartySize")} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }).map((_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>
                                {i + 1} {i === 0 ? t("person") : t("people")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="area"
                          className="text-sm font-medium text-gray-700"
                        >
                          {/* Preferred Area */}
                          {t("preferredArea")}
                        </Label>
                        <Select value={area} onValueChange={setArea}>
                          <SelectTrigger id="area" className="w-full">
                            <SelectValue placeholder={t("noPreference")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              {t("noPreference")}
                            </SelectItem>
                            {areas
                              ?.filter((a) => a.active)
                              .map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Capacity Widget */}
                    {date && selectedTime && (
                      <div className="mt-4">
                        <DailyCapacityWidget
                          restaurantId={restaurant?.id}
                          date={getUTCFromLocalDateTime(
                            date.toISOString().split("T")[0],
                            selectedTime,
                            restaurant.timezone || "Europe/Rome"
                          )}
                          partySize={Number(partySize)}
                          onLoadingChange={(isLoading) => setLoading(isLoading)}
                          onAvailabilityChange={(value) =>
                            setCanCreateReservation(value)
                          }
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("fullName")}
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="John Doe"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("email")}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="john@example.com"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("phone")}
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label
                          htmlFor="notes"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("specialRequests")}
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t("specialRequestsPlaceholder")}
                          rows={3}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        {/* Checkbox row */}
                        <label className="flex items-start gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                          />
                          <span>{t("agreePolicies")} </span>
                        </label>

                        {/* Button under checkbox */}
                        {restaurant?.Reservation_policy && (
                          <ReservationPoliciesDialog
                            policies={restaurant.Reservation_policy}
                          >
                            <span className="text-blue-500 underline cursor-pointer">
                              {""}
                              {t("viewPolicies")}
                            </span>
                          </ReservationPoliciesDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-5 shadow-lg gap-0 sticky top-20">
                <h3 className="text-xl mb-3 font-bold text-gray-900 pb-2 border-b">
                  {t("reservationSummary")}
                </h3>

                {/* Restaurant Info */}
                <div className="space-y-3 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {restaurant.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {restaurant.address}
                      </p>
                    </div>
                  </div>
                  <p className="inline-flex top-3 right-3 items-center gap-1 px-2 py-0.5 text-[13px] font-medium bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                    {restaurant?.timezone}
                  </p>

                  {/* Reservation Details */}
                  {(date || selectedTime || partySize !== "2") && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900">
                        {t("yourReservation")}
                      </h4>

                      {date && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("date2")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {date.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      {selectedTime && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("time2")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedTime}
                          </span>
                        </div>
                      )}

                      {partySize && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("guests")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {partySize}{" "}
                            {parseInt(partySize) === 1
                              ? t("person")
                              : t("people")}
                          </span>
                        </div>
                      )}

                      {area !== "none" && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("preferredAreaLabel")}{" "}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {areas.find((a) => a.id === area)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Deposit Information */}
                  {displayDepositAmount > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {t("depositRequired")}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {displayDepositAmount}{" "}
                          {settings?.deposit_settings?.depositCurrency || "EUR"}
                        </span>
                      </div>
                      {displayAppliedRule && (
                        <div className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-md mb-3">
                          {getRuleDescription(displayAppliedRule)}
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        {t("depositNote")}
                      </p>
                    </div>
                  )}

                  {/* Policies */}
                  {settings && (
                    <>
                      {settings?.deposit_settings?.cancellationPolicies
                        ?.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            {t("cancellationPolicies")}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            {settings.deposit_settings.cancellationPolicies
                              .filter((policy: any) => policy.active)
                              .map((policy: any) => (
                                <div
                                  key={`${Math.random()}-${Math.random()}`}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />

                                  {t("cancelWithin", {
                                    hours: policy.hoursBefore,
                                    percent: policy.refundPercentage,
                                  })}
                                  {/* Cancel within {policy.hoursBefore} hours for{" "}
                                  {policy.refundPercentage}% refund */}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* Submit Button  */}
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !date ||
                      !selectedTime ||
                      !name ||
                      !email ||
                      isTimeBlocked ||
                      !canCreateReservation ||
                      loading ||
                      !phoneRegex.test(phone)
                    }
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {displayDepositAmount > 0
                          ? t("processing")
                          : t("creatingReservation")}
                      </span>
                    ) : isTimeBlocked ? (
                      t("timeSlotUnavailableBtn")
                    ) : (
                      `${t("completeReservation")} ${
                        displayDepositAmount > 0 ? t("payDeposit") : ""
                      }`
                    )}
                  </button>
                  {/* Help Text */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      {t("helpText", {
                        phone: restaurant.phone || t("resturantdirectly"),
                      })}
                      {/* Need to make changes? Contact us at{" "}
                      {restaurant.phone || "the restaurant directly"}. */}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate rule descriptions
function getRuleDescription(rule: DynamicRule): string {
  const amount = parseFloat(rule.amount);

  switch (rule.ruleType) {
    case "special-date":
      return `Special date rate: ${
        rule.depositType === "per-person"
          ? `€${amount} per person`
          : `€${amount} flat rate`
      }`;

    case "time-slot":
      return `Time slot rate (${rule.startTime}-${rule.endTime}): ${
        rule.depositType === "per-person"
          ? `€${amount} per person`
          : `€${amount} flat rate`
      }`;

    case "party-size":
      return `Party size rate (${rule.minPartySize}-${
        rule.maxPartySize
      } people): ${
        rule.depositType === "per-person"
          ? `€${amount} per person`
          : `€${amount} flat rate`
      }`;

    case "day-of-week":
      const daysMap: { [key: string]: string } = {
        "0": "Sunday",
        "1": "Monday",
        "2": "Tuesday",
        "3": "Wednesday",
        "4": "Thursday",
        "5": "Friday",
        "6": "Saturday",
      };
      const dayNames =
        rule.days
          ?.split(",")
          .map((d) => daysMap[d.trim()])
          .join(", ") || "";
      return `${dayNames} rate: ${
        rule.depositType === "per-person"
          ? `€${amount} per person`
          : `€${amount} flat rate`
      }`;

    default:
      return `${
        rule.depositType === "per-person"
          ? `€${amount} per person`
          : `€${amount} flat rate`
      }`;
  }
}

export default BookingInterface;
