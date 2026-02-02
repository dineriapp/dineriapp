"use client"
import React from 'react'
import { Button } from './ui/button';
import { useUpgradePopupStore } from '@/stores/upgrade-popup-store';
import { Crown } from 'lucide-react';
import { useTranslations } from 'next-intl';

const UpgradeBtn = () => {
    const openPopup = useUpgradePopupStore(state => state.open)
    const t = useTranslations("update")
    return (
        <Button
            size="sm"
            type='button'
            onClick={() => {
                openPopup(t("text"));
            }}
            className=" max-md:!aspect-square max-sm:!size-[40px] !h-[40px] bg-main-green cursor-pointer rounded-full !px-4 text-white  flex items-center gap-2 shadow-sm hover:shadow transition-all"
        >
            <Crown className="h-4 w-4" />
            <span className="font-medium sm:flex hidden">
                {t("btn")}
            </span>
        </Button>
    )
}

export default UpgradeBtn
