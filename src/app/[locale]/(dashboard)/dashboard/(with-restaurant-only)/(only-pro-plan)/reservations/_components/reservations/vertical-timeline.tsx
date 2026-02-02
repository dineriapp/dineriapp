"use client";
import { ReservationUp } from '@/lib/types';
import { Check, Clock, UserCircle, WalletMinimal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState, useCallback } from 'react';

const HOUR_HEIGHT = 80; // Height for each hour
const TABLE_LABEL_HEIGHT = 50; // Height for table headers
const totalHours = 24;

// Helper function to create time formatter with specific timezone
const createTimeFormatter = (timezone: string) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
    });
};

// Helper function to create date in specific timezone
const createDateInTimezone = (timezone: string, hours: number, minutes: number) => {
    const date = new Date();
    // Use toLocaleString to get the date in the target timezone
    const dateString = date.toLocaleString("en-US", { timeZone: timezone });
    const timezoneDate = new Date(dateString);
    timezoneDate.setHours(hours, minutes, 0, 0);
    return timezoneDate;
};

// Helper function to parse and convert reservation time to target timezone
const parseReservationTime = (timeString: string, timezone: string): Date => {
    const date = new Date(timeString);
    // Convert to target timezone
    return new Date(date.toLocaleString("en-US", { timeZone: timezone }));
};

const VerticalTimeline = ({
    reservations,
    timezone = "Europe/Rome"
}: {
    reservations: ReservationUp[];
    timezone: string
}) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const t = useTranslations("reservationTimeline.Timeline")

    // Generate time slots for 24 hours in 30-minute intervals using the specified timezone
    const timeSlots = useMemo(() => {
        const fmt = createTimeFormatter(timezone);
        return Array.from({ length: 48 }, (_, i) => {
            const hours = Math.floor(i / 2);
            const minutes = i % 2 === 0 ? 0 : 30;
            const date = createDateInTimezone(timezone, hours, minutes);
            const str = fmt.format(date);
            return { value: str, label: str };
        });
    }, [timezone]);

    // Helper function to convert time to vertical position
    const getPositionFromTime = (date: Date) => {
        const fmt = createTimeFormatter(timezone);
        const timeString = fmt.format(date);
        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':').map(Number);

        // Convert to 24-hour format
        let totalMinutes = hours * 60 + minutes;
        if (period === 'PM' && hours !== 12) {
            totalMinutes += 12 * 60;
        } else if (period === 'AM' && hours === 12) {
            totalMinutes -= 12 * 60;
        }

        return (totalMinutes / 30) * (HOUR_HEIGHT / 2);
    };

    // Helper function to get duration in pixels
    const getDurationHeight = (durationMinutes: number) => {
        return (durationMinutes / 30) * (HOUR_HEIGHT / 2);
    };

    // Create formatter for display
    const displayFormatter = useMemo(() => createTimeFormatter(timezone), [timezone]);

    // Get unique tables from reservations
    const tables = useMemo(() => {
        const map = new Map<string, ReservationUp["table_reservations"][number]["table"]>();

        reservations.forEach(res => {
            res.table_reservations.forEach(tr => {
                if (!map.has(tr.table.id)) {
                    map.set(tr.table.id, tr.table);
                }
            });
        });

        return Array.from(map.values());
    }, [reservations]);


    // Group reservations by table
    const reservationsByTable = tables.reduce((acc, table) => {
        acc[table.id] = reservations.filter(reservation =>
            reservation.table_reservations.some(tr => tr.table_id === table.id)
        );
        return acc;
    }, {} as Record<string, ReservationUp[]>);

    // Drag scroll handlers for vertical scrolling
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!timelineRef.current) return;

        setIsDragging(true);
        setStartY(e.pageY - timelineRef.current.offsetTop);
        setScrollTop(timelineRef.current.scrollTop);

        // Change cursor to grabbing
        timelineRef.current.style.cursor = 'grabbing';
        timelineRef.current.style.userSelect = 'none';
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (isDragging && timelineRef.current) {
            timelineRef.current.style.cursor = 'grab';
        }
        setIsDragging(false);
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.style.cursor = 'grab';
            timelineRef.current.style.userSelect = 'auto';
        }
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !timelineRef.current) return;

        e.preventDefault();
        const y = e.pageY - timelineRef.current.offsetTop;
        const walk = (y - startY) * 2; // Scroll multiplier
        timelineRef.current.scrollTop = scrollTop - walk;
    }, [isDragging, startY, scrollTop]);

    return (
        <>
            <div
                ref={timelineRef}
                className="relative overflow-y-auto overflow-x-auto h-[550px] border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                <div style={{ minHeight: `${TABLE_LABEL_HEIGHT + HOUR_HEIGHT * totalHours}px` }} className="flex">
                    {/* Time labels column - sticky */}
                    <div className="sticky left-0 z-20 bg-slate-50 border-r-2 border-slate-300 shadow-sm">
                        <div
                            style={{ height: `${TABLE_LABEL_HEIGHT + 2}px` }}
                            className="bg-slate-100 px-4 font-semibold text-slate-800 text-sm flex items-center justify-center border-b border-slate-300"
                        >
                            {t("timeHeader")}

                        </div>
                        {timeSlots.map((slot, index) => (
                            <div
                                key={`${slot.label}-${index}`}
                                className="relative flex-shrink-0 border-b border-slate-200"
                                style={{ height: `${HOUR_HEIGHT / 2}px` }}
                            >
                                <div className="text-center font-medium text-xs h-full text-slate-700 flex items-center justify-center px-2">
                                    <span className="font-semibold">{slot.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tables and reservations */}
                    <div className="flex-1">
                        {/* Table headers */}
                        <div className="flex border-b-2 border-slate-300 bg-slate-50 sticky top-0 z-10">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    style={{ width: '300px', height: `${TABLE_LABEL_HEIGHT}px` }}
                                    className="border-r border-slate-200 px-4 py-4 flex items-center justify-center flex-shrink-0"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${table.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            {table.table_number}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Timeline grid and reservations */}
                        <div className="relative flex">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    style={{ width: '300px' }}
                                    className="border-r border-slate-200 relative flex-shrink-0"
                                >
                                    {/* Timeline background with alternating shades */}
                                    <div className="relative">
                                        {timeSlots.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`border-b flex-shrink-0 ${index % 4 < 2 ? 'bg-white' : 'bg-slate-50'}`}
                                                style={{ height: `${HOUR_HEIGHT / 2}px` }}
                                            />
                                        ))}
                                    </div>

                                    {/* Reservations for this table */}
                                    <div className="absolute top-0 left-1 right-1 bottom-0">
                                        {reservationsByTable[table.id]?.map((reservation) => {
                                            const startTime = parseReservationTime(`${reservation.arrival_time}`, timezone);
                                            const duration = reservation.estimated_duration_minutes || 90; // Default 1.5 hour
                                            const top = getPositionFromTime(startTime);
                                            const height = Math.max(getDurationHeight(duration), 60); // Minimum height

                                            // Calculate end time for display
                                            const endTime = new Date(startTime.getTime() + duration * 60000);

                                            return (
                                                <div
                                                    key={reservation.id}
                                                    className={`absolute rounded-lg hover:border-blue-300 border-transparent border shadow-sm hover:shadow-lg px-2.5 py-2 flex flex-col justify-center cursor-pointer transition-all duration-200 bg-blue-100 group/reservation`}
                                                    style={{
                                                        top: `${top}px`,
                                                        height: `${height}px`,
                                                        width: 'calc(100%)',
                                                        minHeight: '60px'
                                                    }}
                                                    title={`
${t("tooltip.customer")} ${reservation.customer_name}
${t("tooltip.email")} ${reservation.customer_email}
${t("tooltip.time")} ${displayFormatter.format(startTime)} - ${displayFormatter.format(endTime)}
${t("tooltip.partySize")} ${reservation.party_size}
${t("tooltip.status")} ${reservation.status}
${t("tooltip.duration")} ${duration} ${t("tooltip.minutes")}
${reservation.special_requests ? `${t("tooltip.specialRequests")} ${reservation.special_requests}` : ''}
${reservation.preferred_area ? `${t("tooltip.preferredArea")} ${reservation.preferred_area}` : ''}
    `.trim()}
                                                >
                                                    <div className='flex flex-col gap-1 h-full justify-between'>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm truncate leading-tight">
                                                                    {reservation.customer_name}
                                                                </p>
                                                                <p className="text-xs text-opacity-80 truncate">
                                                                    {reservation.customer_email.toLocaleLowerCase()}
                                                                </p>
                                                            </div>
                                                            <div className='flex flex-col items-end gap-1'>
                                                                <div className='flex gap-1'>
                                                                    <div
                                                                        className={`px-1.5 py-0.5 w-fit rounded-full text-[10px] font-medium uppercase tracking-wide
    ${reservation.status === 'CONFIRMED' ? 'bg-blue-500 text-white' :
                                                                                reservation.status === 'SEATED' ? 'bg-green-500 text-white' :
                                                                                    reservation.status === 'PENDING' ? 'bg-yellow-500 text-black' :
                                                                                        reservation.status === 'COMPLETED' ? 'bg-gray-400 text-black' :
                                                                                            'bg-red-400 text-white'}`}
                                                                    >
                                                                        {reservation.status.toLowerCase()}
                                                                    </div>
                                                                    {reservation.payment ? (
                                                                        <div
                                                                            className={`flex items-center gap-1 px-1.5 rounded-full text-[10px] font-medium
      ${reservation.payment.status === "PAID"
                                                                                    ? "bg-green-600/20 text-green-700"
                                                                                    : "bg-yellow-600/20 text-yellow-700"
                                                                                }`}
                                                                        >
                                                                            {reservation.payment.status === "PAID" ? (
                                                                                <>
                                                                                    <Check className="size-3" />
                                                                                    {t("payment.paid")}
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Clock className="size-3" />
                                                                                    {t("payment.pending")}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-600/20 text-red-700">
                                                                            <WalletMinimal className="size-3" />
                                                                            {t("payment.noPay")}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className='size-3' />
                                                                <span className="text-xs font-medium opacity-90">
                                                                    {displayFormatter.format(startTime)}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5">
                                                                <UserCircle className='size-3' />
                                                                <span className="text-xs font-medium opacity-90">
                                                                    {reservation.party_size}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-3 h-3 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="text-xs font-medium opacity-90">
                                                                    {duration}m
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Legend */}
            <div className="mt-3 bg-white border-t border-slate-200 px-4 py-2 flex items-center gap-6 text-xs">
                <div className="font-semibold text-slate-700">
                    {t("legend.title")}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>
                        {t("legend.confirmed")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>
                        {t("legend.seated")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>
                        {t("legend.pending")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span>
                        {t("legend.completed")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span>
                        {t("legend.cancelled")}
                    </span>
                </div>
            </div>
        </>
    );
};

export default VerticalTimeline;