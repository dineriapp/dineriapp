import { Badge } from "@/components/ui/badge";
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

export const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return <Badge className="bg-green-500">Paid</Badge>
    case "PENDING":
      return <Badge className="bg-yellow-500">Pending</Badge>
    case "FAILED":
      return <Badge className="bg-red-500">Failed</Badge>
    case "REFUNDED":
      return <Badge className="bg-blue-500">Refunded</Badge>
    default:
      return null
  }
}
