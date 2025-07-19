import { notFound } from "next/navigation"
import { Suspense } from "react"
import OrderSuccessLoading from "./order-loading";
import OrderSuccessContent from "./order-success";

interface OrderSuccessPageProps {
    params: Promise<{ slug: string }>
    searchParams: { session_id?: string; order_number?: string }
}

export default async function OrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
    const { slug } = await params
    const { session_id, order_number } = searchParams

    if (!session_id && !order_number) {
        notFound()
    }

    return (
        <Suspense fallback={<OrderSuccessLoading />}>
            <OrderSuccessContent sessionId={session_id} orderNumber={order_number} restaurantSlug={slug} />
        </Suspense>
    )
}



