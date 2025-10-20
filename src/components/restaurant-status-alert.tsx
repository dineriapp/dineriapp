"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RestaurantStatus } from "@prisma/client"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
    status: RestaurantStatus
}

export default function RestaurantStatusAlert({ status }: Props) {
    const t = useTranslations("restaurant_status_alert")
    let title = ""
    let message = ""

    if (status === "DISABLE_BOTH") {
        title = t("disable_both_title")
        message = t("disable_both_message")
    } else if (status === "DISABLE_DELIVERY") {
        title = t("disable_delivery_title")
        message = t("disable_delivery_message")
    } else if (status === "DISABLE_PICKUP") {
        title = t("disable_pickup_title")
        message = t("disable_pickup_message")
    } else {
        // ALLOKAY -> show nothing
        return null
    }

    return (
        <div className="mb-4">
            <Alert variant="destructive" className="border-red-400 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </div>
    )
}
