import { CheckCircle, Clock, Truck, XCircle } from "lucide-react";

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
