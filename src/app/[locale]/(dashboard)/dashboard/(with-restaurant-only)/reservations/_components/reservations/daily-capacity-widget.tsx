"use client";
import { useEffect, useState } from 'react';

interface ProductionCapacityData {
    canCreateReservation: boolean;
    reason: string;
    details: {
        type: string;
        tables?: Array<{
            id: string;
            tableNumber: string;
            name: string;
            capacity: number;
            area: string;
            minPartySize: number;
            maxPartySize: number;
        }>;
        tableMethod?: string;
        tableCount?: number;
        totalTableCapacity?: number;
        deposit?: {
            amount: number;
            currency: string;
            required: boolean;
        };
        capacity?: {
            total: number;
            available: number;
            utilized: number;
            utilizationPercentage: number;
        };
        settings?: {
            tableCombinationsEnabled: boolean;
            estimatedDuration: number;
        };
        availableCapacity?: number;
        requiredCapacity?: number;
        tableCombinationsEnabled?: boolean;
    } | null;
}

// Daily overview data structure
interface DailyCapacityData {
    date: string;
    capacity: {
        total: number;
        available: number;
        utilized: number;
        utilizationPercentage: number;
    };
    reservations: {
        total: number;
        byStatus: {
            pending: number;
            confirmed: number;
            seated: number;
            completed: number;
            cancelled: number;
        };
        guests: {
            total: number;
            pending: number;
            confirmed: number;
            seated: number;
            averagePartySize: number;
        };
    };
    summary: {
        isFullyBooked: boolean;
        hasAvailability: boolean;
        bookingIntensity: string;
        recommendation: string;
    };
}

// Time slot overview data structure
interface TimeSlotCapacityData {
    date: string;
    time: string;
    capacity: {
        total: number;
        available: number;
        utilized: number;
        utilizationPercentage: number;
    };
    tableAvailability: {
        byCapacity: Array<{
            range: string;
            min: number;
            max: number;
            count: number;
        }>;
        totalAvailable: number;
    };
    summary: {
        status: string;
        recommendedPartySizes: string[];
        peakHour: boolean;
    };
}

type ApiResponseData = ProductionCapacityData | DailyCapacityData | TimeSlotCapacityData;

interface DailyCapacityWidgetProps {
    restaurantId: string;
    selectedDate: Date;
    selectedTime?: string;
    partySize?: number;
    showTimeSlotView?: boolean;
}

const DailyCapacityWidget = ({
    restaurantId,
    selectedDate,
    selectedTime,
    partySize,
}: DailyCapacityWidgetProps) => {
    const [capacityData, setCapacityData] = useState<ApiResponseData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCapacityData = async (date: string, time?: string, partySize?: number) => {
        setLoading(true);
        setError(null);

        try {
            let url = `/api/restaurants/${restaurantId}/capacity?date=${date}`;

            if (time) {
                url += `&time=${encodeURIComponent(time)}`;
            }

            if (partySize) {
                url += `&partySize=${partySize}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch capacity data');
            }

            const result = await response.json();

            if (result.success) {
                setCapacityData(result.data);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const dateString = selectedDate.toISOString().split('T')[0];
        fetchCapacityData(dateString, selectedTime, partySize);
    }, [selectedDate, selectedTime, partySize, restaurantId]);

    // Type guards
    const isProductionCapacityData = (data: ApiResponseData): data is ProductionCapacityData => {
        return 'canCreateReservation' in data && 'reason' in data;
    };

    const isDailyCapacityData = (data: ApiResponseData): data is DailyCapacityData => {
        return 'reservations' in data && 'byStatus' in (data as any).reservations;
    };

    const isTimeSlotCapacityData = (data: ApiResponseData): data is TimeSlotCapacityData => {
        return 'time' in data && 'tableAvailability' in data && 'byCapacity' in (data as any).tableAvailability;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-red-600 text-center">
                    <p>Error loading capacity data</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!capacityData) {
        return null;
    }

    const getStatusColor = (status: boolean) => {
        return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    // const getDetailTypeColor = (type: string) => {
    //     switch (type) {
    //         case 'available': return 'bg-green-100 text-green-800';
    //         case 'opening_hours': return 'bg-orange-100 text-orange-800';
    //         case 'time_override': return 'bg-purple-100 text-purple-800';
    //         case 'capacity': return 'bg-red-100 text-red-800';
    //         case 'table_availability': return 'bg-yellow-100 text-yellow-800';
    //         default: return 'bg-gray-100 text-gray-800';
    //     }
    // };

    const getBookingIntensityColor = (intensity: string) => {
        switch (intensity.toUpperCase()) {
            case 'FULL': return 'bg-red-100 text-red-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTimeSlotStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'GOOD_AVAILABILITY': return 'bg-green-100 text-green-800';
            case 'LIMITED_AVAILABILITY': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Render Production Capacity Check View (time + partySize)
    if (isProductionCapacityData(capacityData)) {
        const { canCreateReservation, reason, details } = capacityData;

        return (
            <div className="bg-white rounded-lg shadow p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Reservation Feasibility Check
                        </h2>
                        <p className="text-xs text-gray-500">
                            {selectedDate.toLocaleDateString()} at {selectedTime}
                            {partySize && ` • ${partySize} guests`}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(canCreateReservation)}`}>
                            {canCreateReservation ? 'Available' : 'Not Available'}
                        </div>
                        {/* {details && (
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDetailTypeColor(details.type)}`}>
                                {details.type.replace('_', ' ')}
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Decision Reason */}
                <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Decision</h3>
                    <div className={`rounded-lg p-3 ${canCreateReservation ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-sm ${canCreateReservation ? 'text-green-800' : 'text-red-800'}`}>
                            {reason}
                        </p>
                    </div>
                </div>

                {/* Details Section */}
                {details && (
                    <div className="space-y-3">
                        {/* Capacity Information */}
                        {details.capacity && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Capacity Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-blue-900">
                                            {details.capacity.utilized}/{details.capacity.total}
                                        </div>
                                        <div className="text-sm text-blue-700">
                                            Guests / Capacity
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            {details.capacity.utilizationPercentage}% utilized
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-green-900">
                                            {details.capacity.available}
                                        </div>
                                        <div className="text-sm text-green-700">
                                            Available Capacity
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-amber-900">
                                            {details.tableCount || 0}
                                        </div>
                                        <div className="text-sm text-amber-700">
                                            Available Tables
                                        </div>
                                        {details.tableMethod && (
                                            <div className="text-xs text-amber-600 mt-1 capitalize">
                                                {details.tableMethod} method
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table Availability */}
                        {details.tables && details.tables.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                    Assigned Tables ({details.tableMethod})
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {details.tables.map((table) => (
                                            <div key={table.id} className="bg-white rounded-lg border p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {table.tableNumber}
                                                        </div>
                                                        <div className="text-sm text-gray-600">{table.area}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-gray-900">
                                                            {table.capacity} seats
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {table.minPartySize}-{table.maxPartySize} guests
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {details.totalTableCapacity && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total table capacity:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {details.totalTableCapacity} guests
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Details for Failure Cases */}
                        {!canCreateReservation && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Details</h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    {details.type === 'capacity' && (
                                        <div className="text-sm text-gray-700">
                                            <p>Available capacity: <strong>{details.availableCapacity}</strong> seats</p>
                                            <p>Required capacity: <strong>{details.requiredCapacity}</strong> seats</p>
                                        </div>
                                    )}
                                    {details.type === 'table_availability' && (
                                        <div className="text-sm text-gray-700">
                                            <p>Table combinations enabled: <strong>{details.tableCombinationsEnabled ? 'Yes' : 'No'}</strong></p>
                                            <p>Available capacity: <strong>{details.availableCapacity}</strong> seats</p>
                                        </div>
                                    )}
                                    {details.type === 'opening_hours' && (
                                        <div className="text-sm text-gray-700">
                                            <p>The restaurant is closed or outside of opening hours for the selected time.</p>
                                        </div>
                                    )}
                                    {details.type === 'time_override' && (
                                        <div className="text-sm text-gray-700">
                                            <p>This time slot has been blocked for maintenance or private events.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Bar for Capacity */}
                {details?.capacity && (
                    <div className="my-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Capacity Utilization</span>
                            <span>{details.capacity.utilizationPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${details.capacity.utilizationPercentage >= 90
                                    ? 'bg-red-600'
                                    : details.capacity.utilizationPercentage >= 70
                                        ? 'bg-orange-500'
                                        : details.capacity.utilizationPercentage >= 40
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min(details.capacity.utilizationPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render Time Slot Overview (time without partySize)
    if (isTimeSlotCapacityData(capacityData)) {
        return (
            <div className="bg-white rounded-lg shadow p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Time Slot Capacity
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(`${capacityData.date}T${capacityData.time}`).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeSlotStatusColor(capacityData.summary.status)}`}>
                            {capacityData.summary.status.replace('_', ' ')}
                        </div>
                        {capacityData.summary.peakHour && (
                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Peak Hour
                            </div>
                        )}
                    </div>
                </div>

                {/* Capacity Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-900">
                            {capacityData.capacity.utilized}/{capacityData.capacity.total}
                        </div>
                        <div className="text-sm text-blue-700">
                            Guests / Capacity
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                            {capacityData.capacity.utilizationPercentage}% utilized
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-900">
                            {capacityData.capacity.available}
                        </div>
                        <div className="text-sm text-green-700">
                            Available Capacity
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-amber-900">
                            {capacityData.tableAvailability.totalAvailable}
                        </div>
                        <div className="text-sm text-amber-700">
                            Available Tables
                        </div>
                    </div>
                </div>

                {/* Table Availability by Capacity Range */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Table Availability by Party Size
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {capacityData.tableAvailability.byCapacity.map((range) => (
                            <div key={range.range} className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-gray-900">
                                    {range.count}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {range.range}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {range.min}-{range.max === 999 ? '20+' : range.max} people
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommended Party Sizes */}
                {capacityData.summary.recommendedPartySizes && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Recommended Party Sizes</h3>
                        <div className="flex flex-wrap gap-2">
                            {capacityData.summary.recommendedPartySizes.map((size, index) => (
                                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    {size}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Capacity Utilization</span>
                        <span>{capacityData.capacity.utilizationPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${capacityData.capacity.utilizationPercentage >= 90
                                ? 'bg-red-600'
                                : capacityData.capacity.utilizationPercentage >= 70
                                    ? 'bg-orange-500'
                                    : capacityData.capacity.utilizationPercentage >= 40
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                }`}
                            style={{ width: `${Math.min(capacityData.capacity.utilizationPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }

    // Render Daily Overview (no time)
    if (isDailyCapacityData(capacityData)) {
        return (
            <div className="bg-white rounded-lg shadow p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Daily Capacity
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(capacityData.date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${capacityData.summary.isFullyBooked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {capacityData.summary.isFullyBooked ? 'Fully Booked' : 'Available'}
                    </div>
                </div>

                {/* Capacity Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-900">
                            {capacityData.capacity.utilized}/{capacityData.capacity.total}
                        </div>
                        <div className="text-sm text-blue-700">
                            Guests / Capacity
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                            {capacityData.capacity.utilizationPercentage}% utilized
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-900">
                            {capacityData.reservations.total}
                        </div>
                        <div className="text-sm text-green-700">
                            Total Reservations
                        </div>
                        {capacityData.reservations.guests && (
                            <div className="text-xs text-green-600 mt-1">
                                Avg. {capacityData.reservations.guests.averagePartySize} guests
                            </div>
                        )}
                    </div>

                    <div className={`rounded-lg p-4 ${capacityData.summary.isFullyBooked
                        ? 'bg-red-50 text-red-900'
                        : 'bg-amber-50 text-amber-900'
                        }`}>
                        <div className="text-2xl font-bold">
                            {capacityData.capacity.available}
                        </div>
                        <div className="text-sm">Available Capacity</div>
                        <div className="text-xs mt-1 capitalize">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingIntensityColor(capacityData.summary.bookingIntensity)
                                }`}>
                                {capacityData.summary.bookingIntensity.toLowerCase()} demand
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reservation Status Breakdown */}
                {capacityData.reservations.byStatus && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Reservation Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                            <div className="bg-yellow-50 rounded p-2">
                                <div className="font-semibold text-yellow-800">
                                    {capacityData.reservations.byStatus.pending}
                                </div>
                                <div className="text-xs text-yellow-600">Pending</div>
                            </div>
                            <div className="bg-blue-50 rounded p-2">
                                <div className="font-semibold text-blue-800">
                                    {capacityData.reservations.byStatus.confirmed}
                                </div>
                                <div className="text-xs text-blue-600">Confirmed</div>
                            </div>
                            <div className="bg-purple-50 rounded p-2">
                                <div className="font-semibold text-purple-800">
                                    {capacityData.reservations.byStatus.seated}
                                </div>
                                <div className="text-xs text-purple-600">Seated</div>
                            </div>
                            <div className="bg-green-50 rounded p-2">
                                <div className="font-semibold text-green-800">
                                    {capacityData.reservations.byStatus.completed}
                                </div>
                                <div className="text-xs text-green-600">Completed</div>
                            </div>
                            <div className="bg-red-50 rounded p-2">
                                <div className="font-semibold text-red-800">
                                    {capacityData.reservations.byStatus.cancelled}
                                </div>
                                <div className="text-xs text-red-600">Cancelled</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommendation */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Recommendation</h3>
                    <p className="text-sm text-gray-700">{capacityData.summary.recommendation}</p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Capacity Utilization</span>
                        <span>{capacityData.capacity.utilizationPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${capacityData.capacity.utilizationPercentage >= 90
                                ? 'bg-red-600'
                                : capacityData.capacity.utilizationPercentage >= 70
                                    ? 'bg-orange-500'
                                    : capacityData.capacity.utilizationPercentage >= 40
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                }`}
                            style={{ width: `${Math.min(capacityData.capacity.utilizationPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default DailyCapacityWidget;