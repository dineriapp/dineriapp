"use client"
import { useRestaurantStore } from '@/stores/restaurant-store'
import { Button } from './ui/button'
import { Globe2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const VisitBtn = () => {
    const { selectedRestaurant } = useRestaurantStore()
    const t = useTranslations("global");
    if (!selectedRestaurant) return null
    return (
        <>
            {selectedRestaurant && (
                <Link href={`/${selectedRestaurant.slug}`} target="_blank">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 max-sm:!size-[40px] !bg-main-green text-white !h-[42px] font-inter hover:bg-main-blue hover:text-white !leading-[1] rounded-full cursor-pointer !px-4"
                    >
                        <Globe2 className="h-4 w-4" />
                        <span className='max-sm:hidden'>{t("visit")}</span>
                    </Button>
                </Link>
            )}
        </>
    )
}

export default VisitBtn
