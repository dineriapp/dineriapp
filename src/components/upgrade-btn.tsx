"use client"
import React from 'react'
import { Button } from './ui/button';
import { useUpgradePopupStore } from '@/stores/upgrade-popup-store';
import { Crown } from 'lucide-react';

const UpgradeBtn = () => {
    const openPopup = useUpgradePopupStore(state => state.open)

    return (
        <Button
            size="sm"
            onClick={() => {
                openPopup("Upgrade to Pro or Enterprise to unlock premium features and tools.");
            }}
            className=" max-md:!aspect-square !h-[38px] bg-main-green cursor-pointer rounded-full !px-5 text-white  flex items-center gap-2 shadow-sm hover:shadow transition-all"
        >
            <Crown className="h-4 w-4" />
            <span className="font-medium md:flex hidden">Upgrade</span>
        </Button>
    )
}

export default UpgradeBtn
