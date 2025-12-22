"use client";
import { useTranslations } from 'next-intl';
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
    date: string,
    partySize: number; // Now required
}

const DailyCapacityWidget = ({
    restaurantId,
    partySize,
    date
}: DailyCapacityWidgetProps) => {
    const [capacityData, setCapacityData] = useState<ProductionCapacityData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations("dailyCapacityWidget")
    const fetchCapacityData = async (date: string, partySize: number) => {
        setLoading(true);
        setError(null);

        try {
            const url = `/api/restaurants/${restaurantId}/capacity?date=${date}&partySize=${partySize}`;

            const response = await fetch(url, {
                cache: "no-store"
            });

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
        fetchCapacityData(date, partySize);
    }, [date, partySize, restaurantId]);

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
                    <p>
                        {t("loading.errorTitle")}
                    </p>
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
                        {t("header.title")}
                    </h2>
                    <p className="text-xs text-gray-500">
                        {partySize && t("header.guestsSuffix", { count: partySize })}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(canCreateReservation)}`}>
                        {canCreateReservation ? t("header.available") : t("header.notAvailable")}
                    </div>
                </div>
            </div>

            {/* Decision Reason */}
            <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {t("decision.title")}
                </h3>
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
                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                {t("capacityOverview.title")}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-900">
                                        {details.capacity.utilized}/{details.capacity.total}
                                    </div>
                                    <div className="text-sm text-blue-700">
                                        {t("capacityOverview.guestsCapacityLabel")}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        {t("capacityOverview.utilizedLabel", { percent: details.capacity.utilizationPercentage })}
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-900">
                                        {details.capacity.available}
                                    </div>
                                    <div className="text-sm text-green-700">
                                        {t("capacityOverview.availableCapacityLabel")}
                                    </div>
                                </div>

                                <div className="bg-amber-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-amber-900">
                                        {details.tableCount || 0}
                                    </div>
                                    <div className="text-sm text-amber-700">
                                        {t("capacityOverview.availableTablesLabel")}
                                    </div>
                                    {details.tableMethod && (
                                        <div className="text-xs text-amber-600 mt-1 capitalize">
                                            {t("capacityOverview.methodSuffix", { method: details.tableMethod })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Wasted Capacity Display */}
                    {canCreateReservation && details?.wastedCapacity !== undefined && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                {t("capacityEfficiency.title")}
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {details.wastedCapacity}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {t("capacityEfficiency.wastedCapacityLabel")}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {t("capacityEfficiency.wastedCapacityHint")}
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
                                            {t("capacityEfficiency.efficiencyLabel")}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {t("capacityEfficiency.efficiencyHint")}
                                        </div>
                                    </div>
                                </div>

                                {/* Efficiency explanation */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-600">
                                        <strong>Explanation:</strong> {details.tableCount === 1 ?
                                            t("capacityEfficiency.singleTableExplanation", { capacity: `${details.totalTableCapacity}`, guests: partySize }) :

                                            t("capacityEfficiency.combinationExplanation", { capacity: `${details.totalTableCapacity}`, guests: partySize })
                                        }
                                    </div>
                                    {details.tableMethod === 'combination' && (
                                        <div className="text-xs text-amber-600 mt-1">
                                            {t("capacityEfficiency.combinationNote")}
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
                                {t("assignedTables.title", { method: `${details.tableMethod}` })}
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
                                                        {table.capacity} {t("assignedTables.seatsLabel")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {details.totalTableCapacity && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {t("assignedTables.totalTableCapacityLabel")}
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                {details.totalTableCapacity} {t("assignedTables.totalGuestsLabel")}
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
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                {t("failureDetails.title")}
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-3">
                                {details.type === 'capacity' && (
                                    <div className="text-sm text-gray-700">
                                        <p>
                                            {t("failureDetails.capacity.availableCapacity")}
                                            <strong>{details.availableCapacity}</strong>
                                            {t("failureDetails.capacity.seats")}
                                        </p>
                                        <p>
                                            {t("failureDetails.capacity.requiredCapacity")}
                                            <strong>{details.requiredCapacity}</strong>
                                            {t("failureDetails.capacity.seats")}
                                        </p>
                                    </div>
                                )}
                                {details.type === 'table_availability' && (
                                    <div className="text-sm text-gray-700">
                                        <p>
                                            {t("failureDetails.tableAvailability.tableCombinationsEnabled")}
                                            <strong>
                                                {
                                                    details.tableCombinationsEnabled
                                                        ?
                                                        t("failureDetails.tableAvailability.yes")
                                                        :
                                                        t("failureDetails.tableAvailability.no")
                                                }
                                            </strong>
                                        </p>
                                        <p>
                                            {t("failureDetails.tableAvailability.availableCapacity")}
                                            <strong>{details.availableCapacity}</strong>
                                            {t("failureDetails.tableAvailability.seats")}
                                        </p>
                                    </div>
                                )}
                                {details.type === 'opening_hours' && (
                                    <div className="text-sm text-gray-700">
                                        <p>
                                            {t("failureDetails.openingHours.closedMessage")}
                                        </p>
                                    </div>
                                )}
                                {details.type === 'time_override' && (
                                    <div className="text-sm text-gray-700">
                                        <p>
                                            {t("failureDetails.timeOverride.blockedMessage")}
                                        </p>
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
                        <span>
                            {t("capacityUtilization.title")}
                        </span>
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