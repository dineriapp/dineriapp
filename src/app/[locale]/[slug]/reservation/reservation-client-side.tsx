"use client"
import { Restaurant } from '@prisma/client';
import BookingInterface from './_components/booking-interface';
import { ReservationHeader } from './reservation-header';

interface ReservationClientProps {
    restaurant: Restaurant;
}

const ReservationClientSide = ({ restaurant }: ReservationClientProps) => {
    return (
        <div
            style={{
                backgroundColor: restaurant.bgColor
            }}
            className='w-full min-h-screen'>
            <ReservationHeader
                restaurant={restaurant}
                stylesData={{
                    headerBg: restaurant.headerBg,
                    headerCartButtonBG: restaurant.headerCartButtonBG,
                    headerCartButtonBorder: restaurant.headerCartButtonBorder,
                    headerText: restaurant.headerText,
                }}
            />
            <BookingInterface restaurant={restaurant} />
            {/* <pre className='grid overflow-x-auto w-full'>
                {JSON.stringify(restaurant, null, 2)}
            </pre> */}
        </div>
    )
}

export default ReservationClientSide
