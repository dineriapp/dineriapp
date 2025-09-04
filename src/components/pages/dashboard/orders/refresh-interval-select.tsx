import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"

type RefreshSelectProps = {
    refreshSeconds: number
    handleRefreshChange: (value: number) => void
}

export function RefreshIntervalSelect({
    refreshSeconds,
    handleRefreshChange,
}: RefreshSelectProps) {
    return (
        <Select
            value={String(refreshSeconds)}
            onValueChange={(value) => handleRefreshChange(Number(value))}
        >
            <SelectTrigger className="bg-white font-semibold">
                <SelectValue placeholder="Refresh Interval" />
            </SelectTrigger>
            <SelectContent>
                {Array.from({ length: 11 }, (_, i) => {
                    const seconds = i * 60
                    return (
                        <SelectItem key={i} value={String(seconds)}>
                            {i === 0 ? "Off" : `${i} minute${i > 1 ? "s" : ""}`}
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}
