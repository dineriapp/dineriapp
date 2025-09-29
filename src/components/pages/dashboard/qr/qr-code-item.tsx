import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Download, ExternalLink, QrCode, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

export const QRCodeItem = ({ qr, getScanUrl, onCopy, onDownload, onDelete, isDeleting }: any) => {
    const scanUrl = getScanUrl(qr.id)
    const t = useTranslations("qr-codes-page.qrCodeItem")
    return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-blue-100">
                    <QrCode className="h-6 w-6 text-teal-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{qr.name}</h3>
                        <Badge className={qr.typeClass}>{qr.typeLabel}</Badge>
                        {!qr.is_active && <Badge variant="secondary">
                            {t("inactive")}
                        </Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t("created", { date: new Date(qr.created_at).toLocaleDateString() })}
                        {qr.last_scanned_at && (
                            <span> •{" "}
                                {t("lastScanned", { date: new Date(qr.last_scanned_at).toLocaleDateString() })}
                            </span>
                        )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                            {t("scanUrl")}
                        </p>
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{scanUrl.substring(0, 50)}...</code>
                        <Button variant="ghost" size="sm" onClick={() => onCopy(qr.id)} className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-medium">
                        {t("scans", { count: qr.scan_count })}
                    </p>
                    <p className="text-sm text-main-green font-semibold">
                        {qr.scan_count === 0 ? t("neverScanned") : t("active")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"
                        className="bg-main-blue rounded-full aspect-square size-[38px] cursor-pointer hover:bg-main-blue/70"
                        onClick={() => window.open(qr.target_url, "_blank")}>
                        <ExternalLink className="h-4 w-4 text-white" />
                    </Button>
                    {qr.qr_data_url && (
                        <Button variant="outline"
                            className="bg-main-green rounded-full aspect-square size-[38px] cursor-pointer hover:bg-main-green/70"
                            size="sm" onClick={() => onDownload(qr)}>
                            <Download className="h-4 w-4 text-white" />
                        </Button>
                    )}
                    <Button variant="destructive" size="sm"
                        className="bg-destructive rounded-full aspect-square size-[38px] cursor-pointer hover:bg-destructive/70"
                        onClick={() => onDelete(qr.id)} disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
