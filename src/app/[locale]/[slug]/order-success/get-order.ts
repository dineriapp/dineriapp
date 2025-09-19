import prisma from "@/lib/prisma"

export async function getOrderDetails(sessionId: string, orderNumber: string) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                OR: [{ stripe_session_id: sessionId }, { order_number: orderNumber }],
            },
            include: {
                restaurant: true,
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        })

        return order
    } catch (error) {
        console.error("Error fetching order:", error)
        return null
    }
}