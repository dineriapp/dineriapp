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
            // REMOVED: minPartySize and maxPartySize since they're not in the API response
        }>;
        tableMethod?: string;
        tableCount?: number;
        totalTableCapacity?: number;
        wastedCapacity?: number;
        efficiency?: number;
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

interface DailyCapacityWidgetProps {
    restaurantId: string;
    selectedDate: Date;
    selectedTime: string; // Now required
    partySize: number; // Now required
}

const DailyCapacityWidget = ({
    restaurantId,
    selectedDate,
    selectedTime,
    partySize,
}: DailyCapacityWidgetProps) => {
    const [capacityData, setCapacityData] = useState<ProductionCapacityData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCapacityData = async (date: string, time: string, partySize: number) => {
        setLoading(true);
        setError(null);

        try {
            const url = `/api/restaurants/${restaurantId}/capacity?date=${date}&time=${encodeURIComponent(time)}&partySize=${partySize}`;

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

    const getStatusColor = (status: boolean) => {
        return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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

                    {/* Wasted Capacity Display */}
                    {canCreateReservation && details?.wastedCapacity !== undefined && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Capacity Efficiency</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {details.wastedCapacity}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Wasted Capacity
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Extra seats not used
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-2xl font-bold ${details.efficiency && details.efficiency >= 80 ? 'text-green-600' :
                                            details.efficiency && details.efficiency >= 60 ? 'text-yellow-600' :
                                                'text-orange-600'
                                            }`}>
                                            {details.efficiency}%
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Efficiency
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Party size vs table capacity
                                        </div>
                                    </div>
                                </div>

                                {/* Efficiency explanation */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-600">
                                        <strong>Explanation:</strong> {details.tableCount === 1 ?
                                            `Single table with ${details.totalTableCapacity} capacity for ${partySize} guests` :
                                            `Table combination with ${details.totalTableCapacity} total capacity for ${partySize} guests`
                                        }
                                    </div>
                                    {details.tableMethod === 'combination' && (
                                        <div className="text-xs text-amber-600 mt-1">
                                            <strong>Note:</strong> Using table combinations may result in some wasted capacity
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
                                                    {/* REMOVED: min/max party size display since it's not in API response */}
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
};

export default DailyCapacityWidget;