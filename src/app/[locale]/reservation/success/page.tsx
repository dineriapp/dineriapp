import { Card } from "@/components/ui/card";
import { normalizeBaseUrl } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Print from "./print";
import { getTranslations } from "next-intl/server";

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
    reservation_id?: string;
  }>;
}

async function verifyAndUpdateReservation(
  sessionId: string,
  reservationId: string
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const stripeResponse = await fetch(
      `${normalizeBaseUrl(baseUrl)}/api/stripe/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          reservation_id: reservationId,
        }),
      }
    );

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      throw new Error(
        errorData.error || `Failed to verify payment: ${stripeResponse.status}`
      );
    }

    const result = await stripeResponse.json();

    if (!result.success) {
      throw new Error(result.error || "Payment verification failed");
    }

    return {
      success: true,
      reservation: result.reservation,
      payment: result.payment,
      message: result.message,
    };
  } catch (error) {
    console.error("Error verifying reservation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to verify payment status",
    };
  }
}

export default async function ReservationSuccess({
  searchParams,
}: SuccessPageProps) {
  const t = await getTranslations("ReservationSuccess");
  const params = await searchParams;
  const sessionId = params.session_id;
  const reservationId = params.reservation_id;

  if (!sessionId || !reservationId) {
    notFound();
  }

  const verificationResult = await verifyAndUpdateReservation(
    sessionId,
    reservationId
  );

  if (!verificationResult.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full gap-0 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t("verificationFailed.title")}
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            {verificationResult.error || t("verificationFailed.description")}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("actions.backToHome")}
          </Link>
        </Card>
      </div>
    );
  }

  const { reservation, payment } = verificationResult;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-[600px] mx-auto">
        <Card className="p-6 gap-0">
          {/* Success Header */}
          <div className="text-center mb-3">
            <div className="w-18 h-18 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle className="h-9 w-9 text-[#009a5e]" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {t("successHeader.title")}
            </h1>

            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              {t("successHeader.description")}
            </p>
          </div>


          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              {
                icon: Calendar,
                label: t("infoCards.date"),
                value: new Date(reservation.arrival_time).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
              },
              {
                icon: Clock,
                label: t("infoCards.time"),
                value: new Date(reservation.arrival_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
              },
              {
                icon: Users,
                label: t("infoCards.guests"),
                value: reservation.party_size,
              },
              {
                icon: MapPin,
                label: t("infoCards.status"),
                value: reservation.status.toLowerCase(),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border bg-white p-4 text-center shadow-sm hover:shadow-md transition"
              >
                <item.icon className="h-5 w-5 text-[#009a5e] mx-auto mb-1" />
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {item.value}
                </p>
              </div>
            ))}
          </div>


          {/* Reservation Details */}
          <div className="space-y-3 mb-3">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t("reservationDetails.confirmationSent")}
                </p>
                <p className="text-xs text-gray-600">
                  {t("reservationDetails.sentTo", {
                    email: reservation.customer_email,
                  })}
                </p>
              </div>
            </div>

            {payment && payment.status === "PAID" && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle className="h-5 w-5 text-[#009a5e] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {t("reservationDetails.depositPaid")}
                  </p>
                  <p className="text-xs text-emerald-800">
                    {t("reservationDetails.paymentDetails", {
                      amount: payment.amount,
                      currency: payment.currency,
                      paymentMethod: payment.payment_method,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>


          {/* Helpful Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">
              {t("helpfulTips.title")}
            </h3>

            <ul className="text-xs text-amber-800 space-y-1">
              {t.raw("helpfulTips.items").map((item: string, i: number) => (
                <li key={i} className="flex gap-1">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>


          {/* Reference Info */}
          <div className="text-center p-4 bg-gray-100 rounded-xl mb-3 border-dashed border">
            <p className="text-xs text-gray-500 mb-1">
              {t("referenceInfo.label")}
            </p>
            <p className="text-sm font-mono tracking-widest text-gray-900 font-semibold">
              {reservation.id.slice(-8).toUpperCase()}
            </p>
          </div>


          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="bg-[#009a5e] text-white text-center px-4 py-3 rounded-md hover:bg-emerald-700 transition font-semibold text-sm shadow-sm"
            >
              {t("actions.backToHome")}
            </Link>

            <Print />
          </div>

        </Card>
      </div>
    </div>
  );
}
