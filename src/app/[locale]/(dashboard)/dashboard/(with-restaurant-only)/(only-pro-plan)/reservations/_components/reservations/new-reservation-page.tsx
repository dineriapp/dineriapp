"use client"
import LoadingUI from '@/components/loading-ui'
import { useRestaurantStore } from '@/stores/restaurant-store'
import NewReservationForm from './new-reservation-form'

const NewReservationPage = () => {
    const { selectedRestaurant: restaurant } = useRestaurantStore()
    if (!restaurant) return <LoadingUI text="Loading..." />

    return (
        <>
            <NewReservationForm restaurant={restaurant} />
        </>
    )
}

export default NewReservationPage
