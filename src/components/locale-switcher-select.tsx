'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { LanguagesIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { ReactNode, useTransition } from 'react';

type Props = {
    children: ReactNode;
    defaultValue: string;
};

export default function LocaleSwitcherSelect({
    children,
    defaultValue,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const params = useParams();

    function onSelectChange(nextLocale: string) {
        startTransition(() => {
            router.replace(
                // @ts-expect-error -- TypeScript will validate that only known `params`
                // are used in combination with a given `pathname`. Since the two will
                // always match for the current route, we can skip runtime checks.
                { pathname, params },
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
                            'p-3 cursor-pointer transition-colors rounded-full hover:bg-slate-100',
                            isPending && 'pointer-events-none opacity-60'
                        )}
                    >
                        <Select.Icon>
                            <LanguagesIcon className="h-6 w-6 text-slate-600 transition-colors group-hover:text-slate-900" />
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





