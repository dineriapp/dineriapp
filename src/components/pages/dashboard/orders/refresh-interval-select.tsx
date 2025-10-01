import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"

type RefreshSelectProps = {
    refreshSeconds: number
    handleRefreshChange: (value: number) => void
}

export function RefreshIntervalSelect({
    refreshSeconds,
    handleRefreshChange,
}: RefreshSelectProps) {
    const t = useTranslations("orders.refreshInterval")
    return (
        <Select
            value={String(refreshSeconds)}
            onValueChange={(value) => handleRefreshChange(Number(value))}
        >
            <SelectTrigger className="bg-white font-semibold">
                <SelectValue placeholder={t("label")} />
            </SelectTrigger>
            <SelectContent>
                {Array.from({ length: 11 }, (_, i) => {
                    const seconds = i * 60
                    return (
                        <SelectItem key={i} value={String(seconds)}>
                            {i === 0
                                ? t("off")
                                : i === 1
                                    ? t("minutes", { count: i })
                                    : t("minutes_plural", { count: i })
                            }
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}
