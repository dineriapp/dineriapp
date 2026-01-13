import { Badge } from "@/components/ui/badge";
import { Locale } from "@/i18n/routing";
import { AlertCircle, CheckCircle, CheckCircle2, CheckSquare, Clock, EyeOff, Truck, UserCheck, XCircle } from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "confirmed":
      return <CheckCircle className="h-3 w-3" />;
    case "preparing":
      return <Clock className="h-3 w-3" />;
    case "ready":
      return <CheckCircle className="h-3 w-3" />;
    case "delivered":
      return <Truck className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};


export const getReservationStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Clock className="w-4 h-4 text-yellow-500" />
    case "CONFIRMED":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case "SEATED":
      return <UserCheck className="w-4 h-4 text-amber-500" />
    case "COMPLETED":
      return <CheckSquare className="w-4 h-4 text-emerald-600" />
    case "CANCELLED":
      return <XCircle className="w-4 h-4 text-red-500" />
    case "NO_SHOW":
      return <EyeOff className="w-4 h-4 text-gray-400" />
    default:
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />
  }
}
const PAYMENT_STATUS_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    PAID: "Paid",
    PENDING: "Pending",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  },
  de: {
    PAID: "Bezahlt",
    PENDING: "Ausstehend",
    FAILED: "Fehlgeschlagen",
    REFUNDED: "Erstattet",
  },
  es: {
    PAID: "Pagado",
    PENDING: "Pendiente",
    FAILED: "Fallido",
    REFUNDED: "Reembolsado",
  },
  fr: {
    PAID: "Payé",
    PENDING: "En attente",
    FAILED: "Échoué",
    REFUNDED: "Remboursé",
  },
  it: {
    PAID: "Pagato",
    PENDING: "In sospeso",
    FAILED: "Non riuscito",
    REFUNDED: "Rimborsato",
  },
  nl: {
    PAID: "Betaald",
    PENDING: "In afwachting",
    FAILED: "Mislukt",
    REFUNDED: "Terugbetaald",
  },
}

const PAYMENT_STATUS_BADGE_CLASS: Record<string, string> = {
  PAID: "bg-green-500",
  PENDING: "bg-yellow-500",
  FAILED: "bg-red-500",
  REFUNDED: "bg-blue-500",
}

export const getPaymentStatusBadge = (
  status: string,
  locale: Locale = "en"
) => {
  const label = PAYMENT_STATUS_LABELS[locale]?.[status] ?? status
  const className = PAYMENT_STATUS_BADGE_CLASS[status]

  if (!className) return null

  return <Badge className={className}>{label}</Badge>
}
