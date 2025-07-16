"use client"
import { useRestaurantStore } from '@/stores/restaurant-store'
import Link from 'next/link'
import { Button } from './ui/button'
import { Globe2 } from 'lucide-react'

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
                        className="flex items-center gap-1 !h-[38px] text-slate-600 hover:text-teal-600 hover:bg-slate-50"
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
