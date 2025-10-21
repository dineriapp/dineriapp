"use client"
import { useRestaurantStore } from '@/stores/restaurant-store'
import { Button } from './ui/button'
import { Globe2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const VisitBtn = () => {
    const { selectedRestaurant } = useRestaurantStore()
    if (!selectedRestaurant) return null
    return (
        <>
            {selectedRestaurant && (
                <Link href={`/${selectedRestaurant.slug}`} target="_blank">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 !bg-main-green text-white !h-[40px] font-inter hover:bg-main-blue hover:text-white !leading-[1] rounded-full cursor-pointer !px-4"
                    >
                        <Globe2 className="h-4 w-4" />
                        <span>Visit</span>
                    </Button>
                </Link>
            )}
        </>
    )
}

export default VisitBtn
