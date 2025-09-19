"use client"

import { getRestaurantStatusWithClientView } from "@/hooks/isRestaurantOpenNow"
import { OpeningHoursData } from "@/types"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Props {
  openingHours: OpeningHoursData
  restaurantTimezone: string
}

export default function RestaurantStatus({ openingHours, restaurantTimezone }: Props) {
  const [status, setStatus] = useState<ReturnType<typeof getRestaurantStatusWithClientView> | null>(null)
  const [now, setNow] = useState(DateTime.now())

  useEffect(() => {
    const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone

    const update = () => {
      const nowTime = DateTime.now()
      setNow(nowTime)

      if (restaurantTimezone && openingHours) {
        const result = getRestaurantStatusWithClientView(restaurantTimezone, openingHours, clientTz)
        setStatus(result)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [restaurantTimezone, openingHours])

  if (!status) return null

  const formattedLocalTime = now.toLocaleString({
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  return (
    <Card className="max-w-md px-5 mx-auto pb-0 gap-0 border shadow-sm bg-white pt-0 rounded-xl overflow-hidden">
      <CardHeader className="flex items-center px-0  justify-between !py-4 border-b">
        <CardTitle className="text-base text-nowrap  font-semibold text-gray-900">
          Restaurant Status:-
        </CardTitle>
        <Badge
          variant={status.isOpen ? "default" : "destructive"}
          className={`text-xs px-3 py-1 rounded-full tracking-wide ${status.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
            }`}
        >
          {status.isOpen ? "OPEN NOW" : "CLOSED"}
        </Badge>
      </CardHeader>

      <CardContent className="pt-2 px-2 space-y-3 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-600">Opens at</span>
          <span className="text-gray-900">{status.openingTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-600">Closes at</span>
          <span className="text-gray-900">{status.closingTime}</span>
        </div>

        {status.isOpen && status.timeUntilClose && (
          <div className="flex items-center justify-between text-green-700">
            <span className="font-medium">Closes in</span>
            <span>{status.timeUntilClose}</span>
          </div>
        )}

        {!status.isOpen && status.timeUntilOpen && (
          <div className="flex items-center justify-between text-red-700">
            <span className="font-medium">Opens in</span>
            <span>
              {status.timeUntilOpen}
              {status.nextOpeningDay && (
                <span className="ml-1 text-xs text-gray-500">({status.nextOpeningDay})</span>
              )}
            </span>
          </div>
        )}

        <div className="py-4 mt-3 space-y-2 border-t text-xs text-gray-500">
          <p>
            🕒 Your local time:
          </p>
          <p className="font-medium text-gray-800">{formattedLocalTime}</p>
        </div>
      </CardContent>
    </Card>
  )
}
