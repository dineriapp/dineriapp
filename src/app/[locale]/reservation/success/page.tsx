import { Card } from '@/components/ui/card';
import { normalizeBaseUrl } from '@/lib/utils';
import { CheckCircle, Clock, Mail, MapPin, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Print from './print';

interface SuccessPageProps {
    searchParams: Promise<{
        session_id?: string;
        reservation_id?: string;
    }>;
}

async function verifyAndUpdateReservation(sessionId: string, reservationId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const stripeResponse = await fetch(`${normalizeBaseUrl(baseUrl)}/api/stripe/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                reservation_id: reservationId,
            }),
        });

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.json();
            throw new Error(errorData.error || `Failed to verify payment: ${stripeResponse.status}`);
        }

        const result = await stripeResponse.json();

        if (!result.success) {
            throw new Error(result.error || 'Payment verification failed');
        }

        return {
            success: true,
            reservation: result.reservation,
            payment: result.payment,
            message: result.message,
        };
    } catch (error) {
        console.error('Error verifying reservation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify payment status',
        };
    }
}

export default async function ReservationSuccess({ searchParams }: SuccessPageProps) {
    const params = await searchParams;
    const sessionId = params.session_id;
    const reservationId = params.reservation_id;

    if (!sessionId || !reservationId) {
        notFound();
    }

    const verificationResult = await verifyAndUpdateReservation(sessionId, reservationId);

    if (!verificationResult.success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="p-6 max-w-md w-full gap-0 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        Verification Failed
                    </h1>
                    <p className="text-gray-600 text-sm mb-6">
                        {verificationResult.error || 'We couldn\'t verify your payment. Please contact support.'}
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Return to Home
                    </Link>
                </Card>
            </div>
        );
    }

    const { reservation, payment } = verificationResult;

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-lg mx-auto">
                <Card className="p-6 gap-0">
                    {/* Success Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Reservation Confirmed!
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Your table is booked and ready. We look forward to seeing you!
                        </p>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <Calendar className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Date</p>
                            <p className="text-sm font-medium text-gray-900">
                                {new Date(reservation.arrival_time).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Time</p>
                            <p className="text-sm font-medium text-gray-900">
                                {new Date(reservation.arrival_time).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Guests</p>
                            <p className="text-sm font-medium text-gray-900">
                                {reservation.party_size}
                            </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <MapPin className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Status</p>
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                    {reservation.status.toLowerCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Confirmation Sent</p>
                                <p className="text-xs text-gray-600">
                                    Details sent to {reservation.customer_email}
                                </p>
                            </div>
                        </div>

                        {payment && payment.status === 'PAID' && (
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Deposit Paid</p>
                                    <p className="text-xs text-gray-600">
                                        {payment.amount} {payment.currency} • {payment.payment_method}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Helpful Tips */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-semibold text-amber-900 mb-2">Before You Arrive</h3>
                        <ul className="text-xs text-amber-800 space-y-1">
                            <li>• Arrive 10-15 minutes before your reservation</li>
                            <li>• Bring your ID for verification</li>
                            <li>• Contact us if running late</li>
                        </ul>
                    </div>

                    {/* Reference Info */}
                    <div className="text-center p-3 bg-gray-100 rounded-lg mb-6">
                        <p className="text-xs text-gray-600">Reservation Reference</p>
                        <p className="text-sm font-mono text-gray-900 font-medium">
                            {reservation.id.slice(-8).toUpperCase()}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="bg-blue-600 text-white text-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            Back to Home
                        </Link>
                        <Print />
                    </div>
                </Card>
            </div>
        </div>
    );
}