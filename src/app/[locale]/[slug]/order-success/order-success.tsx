import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrderDetails } from "./get-order"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Mail, MapPin, Navigation, Phone, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getTranslations } from "next-intl/server"

export default async function OrderSuccessContent({
    sessionId,
    orderNumber,
    restaurantSlug,
}: {
    sessionId?: string
    orderNumber?: string
    restaurantSlug: string
}) {
    const order = await getOrderDetails(sessionId || "", orderNumber || "")
    const t = await getTranslations("order_success_page")
    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">
                            {t("order_not_found_title")}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {t("order_not_found_message")}
                        </p>
                        <Link href={`/${restaurantSlug}`}>
                            <Button>
                                {t("back_to_restaurant")}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-800"
            case "preparing":
                return "bg-yellow-100 text-yellow-800"
            case "ready":
                return "bg-blue-100 text-blue-800"
            case "delivered":
                return "bg-purple-100 text-purple-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "confirmed":
                return <CheckCircle className="h-4 w-4" />
            case "preparing":
                return <Clock className="h-4 w-4" />
            case "ready":
                return <CheckCircle className="h-4 w-4" />
            case "delivered":
                return <CheckCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const formatAddress = (order: any) => {
        if (order.delivery_address) {
            return order.delivery_address
        }

        // Fallback to constructing address from components
        const parts = [order.street, order.city, order.state, order.postal_code, order.country].filter(Boolean)
        return parts.join(", ")
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-4">
                {/* Success Header */}
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {t("order_confirmed_title")}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {t("order_confirmed_message", { email: order.customer_email || "" })}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                                {t("order_number_label")}
                            </p>
                            <p className="text-lg font-mono font-semibold">{order.order_number}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            {t("order_status_label")}
                            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="font-medium">
                                    {t("estimated_ready_time")}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {order.estimated_ready_time
                                        ? new Date(order.estimated_ready_time).toLocaleString()
                                        : t("notify_when_ready")}
                                </p>
                            </div>
                        </div>

                        {order.order_type === "delivery" && (
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {t("delivery_address")}
                                        </p>
                                        <p className="text-sm text-gray-600">{formatAddress(order)}</p>
                                        {order.notes && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="font-medium">
                                                    {t("notes_label")}
                                                </span> {order.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {order.latitude && order.longitude && (
                                    <div className="flex items-center gap-3">
                                        <Navigation className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium">
                                                {t("gps_coordinates")}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.latitude.toFixed(6)}, {order.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Restaurant Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{order.restaurant.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {order.restaurant.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{order.restaurant.phone}</span>
                            </div>
                        )}
                        {order.restaurant.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{order.restaurant.email}</span>
                            </div>
                        )}
                        {order.restaurant.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <span className="text-sm">{order.restaurant.address}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            {t("order_details_label")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-start gap-4 py-3 border-b">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-base text-gray-900">{item.name}</h4>

                                        {item.description && (
                                            <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                                        )}

                                        {item.allergens?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.allergens.map((allergen: string) => (
                                                    <Badge key={allergen} variant="secondary" className="text-xs">
                                                        {allergen}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {item.addons?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.addons.map((addon: any) => (
                                                    <Badge key={addon.name} variant="outline" className="text-xs">
                                                        {addon.name} (€{addon.price.toFixed(2)})
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2">
                                            {t("quantity_label")}
                                            {item.quantity}</p>
                                    </div>

                                    <div className="text-right min-w-[70px]">
                                        <p className="text-sm font-semibold text-green-600">
                                            €{(
                                                item.price +
                                                (Array.isArray(item.addons)
                                                    ? item.addons.reduce((sum: any, addon: any) => sum + addon.price, 0)
                                                    : 0)
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>
                                        {t("subtotal_label")}
                                    </span>
                                    <span>€{order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>
                                        {t("tax_label")}
                                    </span>
                                    <span>€{order.tax_amount.toFixed(2)}</span>
                                </div>
                                {order.delivery_fee > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            {t("delivery_fee_label")}
                                        </span>
                                        <span>€{order.delivery_fee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                    <span>
                                        {t("total_label")}
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
                            <CardTitle>
                                {t("special_instructions_label")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">{order.special_instructions}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <Link href={`/${restaurantSlug}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                            {t("back_to_restaurant")}
                        </Button>
                    </Link>
                    <Link href={`/${restaurantSlug}/menu`} className="flex-1">
                        <Button className="w-full">
                            {t("order_again")}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}