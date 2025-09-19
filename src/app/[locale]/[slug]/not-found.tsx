import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-blue-600 p-4">
            <div className="text-center text-white">
                <h1 className="mb-4 text-2xl font-bold">Restaurant Not Found</h1>
                <p className="mb-8 text-center opacity-90">We couldn&apos;t find a restaurant at this address.</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-teal-600 transition-transform hover:scale-105"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    )
}
