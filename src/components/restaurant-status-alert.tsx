"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RestaurantStatus } from "@prisma/client"
import { AlertCircle } from "lucide-react"

interface Props {
    status: RestaurantStatus
}

export default function RestaurantStatusAlert({ status }: Props) {

    let title = ""
    let message = ""

    if (status === "DISABLE_BOTH") {
        title = "Online Orders Disabled"
        message = "This restaurant has temporarily disabled all online orders."
    } else if (status === "DISABLE_DELIVERY") {
        title = "Delivery Unavailable"
        message = "This restaurant is not accepting delivery orders right now. Please choose pickup instead."
    } else if (status === "DISABLE_PICKUP") {
        title = "Pickup Unavailable"
        message = "This restaurant is not accepting pickup orders right now. Please choose delivery instead."
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
