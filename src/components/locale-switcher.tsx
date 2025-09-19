import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import LocaleSwitcherSelect from './locale-switcher-select';
import * as Select from '@radix-ui/react-select';
import { CheckIcon } from 'lucide-react';

export default function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();

    return (
        <>
            <LocaleSwitcherSelect defaultValue={locale} >

                {routing.locales.map((item) => (
                    <Select.Item
                        key={item}
                        className="flex cursor-pointer items-center px-3 py-2 text-base data-[highlighted]:bg-slate-100"
                        value={item}
                    >
                        <div className="mr-2 w-[1rem]">
                            {item === locale && (
                                <CheckIcon className="h-5 w-5 text-slate-600" />
                            )}
                        </div>
                        <span className="text-slate-900">{t(`locales.${item}`)}</span>
                    </Select.Item>
                ))}
            </LocaleSwitcherSelect>
        </>
    );
}




