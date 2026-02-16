"use client"
import { useUpgradePopupStore } from '@/stores/upgrade-popup-store';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

const UpgradeAutoShow = () => {
    const openPopup = useUpgradePopupStore(state => state.open)
    const t = useTranslations("update")

    useEffect(() => {
        if (typeof window === "undefined") return;

        const comingFrom = localStorage.getItem("comingFrom");

        if (comingFrom === "plans") {
            openPopup(t("text"));
            localStorage.removeItem("comingFrom");
        }
    }, [openPopup, t]);

    return <></>
}

export default UpgradeAutoShow
