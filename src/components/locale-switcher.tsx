"use client"
import { routing } from '@/i18n/routing';
import * as Select from '@radix-ui/react-select';
import { CheckIcon } from 'lucide-react';
import { useLocale, } from 'next-intl';
import { Suspense } from 'react';
import LocaleSwitcherSelect from './locale-switcher-select';
import { cn } from '@/lib/utils';

export default function LocaleSwitcher({
    SizeClassName = "!size-10 lg:!size-12",
    IconSizeClassName = "size-[22px] lg:size-[26px]",
    backgroundColor,
    textColor
}: {
    SizeClassName?: string,
    IconSizeClassName?: string,
    backgroundColor?: string
    textColor?: string
}) {
    const locale = useLocale();
    const labels = {
        "en": "🇺🇸 English",
        "es": "🇪🇸 Spanish",
        "fr": "🇫🇷 French",
        "de": "🇩🇪 German",
        "it": "🇮🇹 Italian",
        "nl": "🇳🇱 Dutch"
    }
    return (
        <Suspense fallback={null}>
            <LocaleSwitcherSelect defaultValue={locale} SizeClassName={SizeClassName} IconSizeClassName={IconSizeClassName} backgroundColor={backgroundColor}>

                {routing.locales.map((item) => (
                    <Select.Item
                        key={item}

                        className={cn("flex group  cursor-pointer items-center px-3 py-2 text-base   ", !backgroundColor && "data-[highlighted]:bg-main-green")}
                        value={item}
                    >
                        <div className="mr-2 w-[1rem]">
                            {item === locale && (
                                <CheckIcon className={cn("h-5 w-5", !textColor && " text-slate-600 group-data-[highlighted]:text-white")} style={{
                                    color: textColor ?? ""
                                }} />
                            )}
                        </div>
                        <span className={cn(!textColor && "text-slate-900 group-data-[highlighted]:text-white")}
                            style={{
                                color: textColor ?? ""
                            }}
                        >
                            {labels[item]}
                        </span>
                    </Select.Item>
                ))}
            </LocaleSwitcherSelect>
        </Suspense>
    );
}




