"use client"
import LoadingUI from '@/components/loading-ui'
import { useRestaurantStore } from '@/stores/restaurant-store'
import ReservationQueriesPage from './client'

const QuereisPage = () => {
  const { selectedRestaurant: restaurant } = useRestaurantStore()

  if (!restaurant) return <LoadingUI text="Loading..." />

  return (
    <ReservationQueriesPage restaurantId={restaurant.id} />
  )
}

export default QuereisPage
