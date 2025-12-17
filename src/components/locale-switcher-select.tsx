'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { LanguagesIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ReactNode, useTransition } from 'react';

type Props = {
    children: ReactNode;
    defaultValue: string;
    SizeClassName?: string;
    IconSizeClassName?: string;
};

export default function LocaleSwitcherSelect({
    children,
    defaultValue,
    SizeClassName,
    IconSizeClassName
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function onSelectChange(nextLocale: string) {
        startTransition(() => {
            const query = searchParams.toString();
            router.replace(
                // keep existing query string
                query ? `${pathname}?${query}` : pathname,
                { locale: nextLocale }
            );
        });
    }

    return (
        <>
            <div className="relative">
                <Select.Root defaultValue={defaultValue} onValueChange={onSelectChange}>
                    <Select.Trigger
                        className={clsx(
                            ' cursor-pointer transition-colors flex items-center justify-center rounded-full bg-main-green hover:bg-main-green/80',
                            isPending && 'pointer-events-none opacity-60',
                            SizeClassName
                        )}
                    >
                        <Select.Icon>
                            <LanguagesIcon className={cn(" text-white transition-colors group-hover:text-slate-900", IconSizeClassName)} />
                        </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content
                            align="end"
                            className="min-w-[8rem] z-[999999] overflow-hidden rounded-sm bg-white cursor-pointer shadow-md"
                            position="popper"
                        >
                            <Select.Viewport>
                                {children}
                            </Select.Viewport>
                            <Select.Arrow className="fill-white text-white" />
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
            </div>
        </>
    );
}





