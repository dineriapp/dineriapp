"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Addon {
    name: string;
    price: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    addons: Addon[];
    onConfirm: (selectedAddons: Addon[]) => void;
}

export function AddonSelectorDialog({ isOpen, onClose, addons, itemName, onConfirm }: Props) {
    const [selected, setSelected] = useState<Addon[]>([]);
    const t = useTranslations("addon_selector_dialog_menu_page")
    const toggleAddon = (addon: Addon) => {
        setSelected((prev) =>
            prev.find((a) => a.name === addon.name)
                ? prev.filter((a) => a.name !== addon.name)
                : [...prev, addon]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-md rounded-xl shadow-xl">
                <DialogHeader className="gap-0">
                    <DialogTitle className="text-lg font-bold text-gray-800">
                        {t("dialog_title", { itemName })}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        {t("dialog_subtitle")}
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {addons.map((addon) => {
                        const isSelected = selected.some((a) => a.name === addon.name);
                        return (
                            <button
                                key={addon.name}
                                onClick={() => toggleAddon(addon)}
                                className={`rounded-lg border-2 p-4 flex flex-col relative items-start gap-1 transition-all ${isSelected
                                    ? "border-teal-600 bg-teal-50 shadow-sm"
                                    : "border-gray-200 hover:border-teal-300"
                                    }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium text-gray-800 text-start">{addon.name}</span>
                                    {isSelected && (
                                        <span className="text-sm absolute bottom-2 right-2 text-teal-600 font-semibold">✓</span>
                                    )}
                                </div>
                                <span className="text-sm text-gray-500">€{addon.price.toFixed(2)}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="pt-6 flex justify-between items-center">
                    <Button onClick={onClose} variant="ghost">
                        {t("cancel_button")}
                    </Button>
                    <Button onClick={() => { onConfirm(selected); onClose(); }} className="bg-teal-600 hover:bg-teal-700 text-white">
                        {t("confirm_button")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
