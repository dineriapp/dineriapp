import { useLocale, } from 'next-intl';
import { routing } from '@/i18n/routing';
import LocaleSwitcherSelect from './locale-switcher-select';
import * as Select from '@radix-ui/react-select';
import { CheckIcon } from 'lucide-react';

export default function LocaleSwitcher() {
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
                        <span className="text-slate-900">
                            {labels[item]}
                        </span>
                    </Select.Item>
                ))}
            </LocaleSwitcherSelect>
        </>
    );
}




