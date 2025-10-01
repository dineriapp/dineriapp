import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderWithItems } from '@/lib/order-queries';
import { getStatusColor } from '@/lib/utils';
import { getStatusIcon } from '@/lib/utils-jsx';
import { Mail, MapPin, Navigation, Phone, Receipt } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react'

const OrderDetailsModel = ({ order }: { order: OrderWithItems }) => {

    const t = useTranslations("orders.orderTable.view-dialog")
    return (
        <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {t("orderStatus")}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {t("created")} {new Date(order.createdAt).toLocaleString()}
                    </p>
                </div>
                <Badge
                    className={`${getStatusColor(order.status)} flex items-center gap-1`}
                >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t("customerInfo")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{order.customer_email}</span>
                        </div>
                        {order.customer_phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{order.customer_phone}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t("orderInfo")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">
                                {t("orderType")}
                            </p>
                            <Badge variant="outline" className="capitalize">
                                {order.order_type}
                            </Badge>
                        </div>
                        {order.estimated_ready_time && (
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t("estimatedReady")}
                                </p>
                                <p className="text-sm font-medium">
                                    {new Date(order.estimated_ready_time).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delivery Information */}
            {order.order_type === "delivery" && order.delivery_address && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {t("deliveryInfo")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">
                                {t("fullAddress")}
                            </p>
                            <p className="text-sm font-medium">{order.delivery_address}</p>
                        </div>

                        {order.street && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">
                                        {t("street")}
                                    </p>
                                    <p className="font-medium">{order.street}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        {t("city")}
                                    </p>
                                    <p className="font-medium">{order.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        {t("state")}
                                    </p>
                                    <p className="font-medium">{order.state}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        {t("zip")}
                                    </p>
                                    <p className="font-medium">{order.postal_code}</p>
                                </div>
                            </div>
                        )}

                        {order.latitude && order.longitude && (
                            <div className="flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {t("gps")}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {order.latitude.toFixed(6)}, {order.longitude.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {order.notes && (
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t("notes")}
                                </p>
                                <p className="text-sm font-medium">{order.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        {t("orderItems")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-start border-b pb-3 last:border-b-0"
                            >
                                <div className="flex-1">
                                    <h4 className="font-medium">{item.name}</h4>

                                    {item.description && (
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    )}

                                    {item.allergens.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.allergens.map((allergen) => (
                                                <Badge key={allergen} variant="secondary" className="text-xs">
                                                    {allergen}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* ✅ Show Addons */}
                                    {item.addons && (
                                        (() => {
                                            let parsedAddons: { name: string; price: number }[] = []

                                            try {
                                                parsedAddons = typeof item.addons === "string"
                                                    ? JSON.parse(item.addons)
                                                    : Array.isArray(item.addons)
                                                        ? item.addons
                                                        : []
                                            } catch (err) {
                                                console.warn("Invalid addons JSON:", err)
                                            }

                                            return (
                                                parsedAddons.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {parsedAddons.map((addon) => (
                                                            <Badge key={addon.name} variant="outline" className="text-xs">
                                                                {addon.name} (+€{addon.price.toFixed(2)})
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )
                                            )
                                        })()
                                    )}

                                    {item.special_requests && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            {t("special")}: {item.special_requests}
                                        </p>
                                    )}

                                    <p className="text-sm text-gray-500 mt-1">
                                        €{item.price.toFixed(2)} × {item.quantity}
                                    </p>
                                </div>

                                <div className="text-right">
                                    {(() => {
                                        let parsedAddons: { name: string; price: number }[] = []

                                        try {
                                            parsedAddons = typeof item.addons === "string"
                                                ? JSON.parse(item.addons)
                                                : Array.isArray(item.addons)
                                                    ? item.addons
                                                    : []
                                        } catch (err) {
                                            console.warn("Invalid addons JSON:", err)
                                        }

                                        const addonsTotal = parsedAddons.reduce((sum, addon) => sum + addon.price, 0)
                                        const totalWithAddons = (item.price + addonsTotal) * item.quantity

                                        return (
                                            <p className="font-medium">€{totalWithAddons.toFixed(2)}</p>
                                        )
                                    })()}
                                </div>
                            </div>
                        ))}


                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>
                                    {t("subtotal")}
                                </span>
                                <span>€{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>
                                    {t("tax")}
                                </span>
                                <span>€{order.tax_amount.toFixed(2)}</span>
                            </div>
                            {order.delivery_fee > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>
                                        {t("deliveryFee")}
                                    </span>
                                    <span>€{order.delivery_fee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                <span>
                                    {t("total")}
                                </span>
                                <span>€{order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Special Instructions */}
            {order.special_instructions && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t("specialInstructions")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{order.special_instructions}</p>
                    </CardContent>
                </Card>
            )}

            {/* Payment Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        {t("paymentStatus")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <span>
                            {t("paymentInfo")}
                        </span>
                        <Badge
                            className={`${order.payment_status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                        >
                            {order.payment_status.charAt(0).toUpperCase() +
                                order.payment_status.slice(1)}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default OrderDetailsModel