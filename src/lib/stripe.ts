import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
    typescript: true,
})

export async function getValidStripeClient(secretKey: string): Promise<false | Stripe> {
    try {
        const testStripe = new Stripe(secretKey, {
            apiVersion: "2025-07-30.basil",
        })

        const account = await testStripe.accounts.retrieve()
        return account?.id ? testStripe : false
    } catch (error) {
        console.error("Invalid Stripe secret key:", error)
        return false
    }
}
