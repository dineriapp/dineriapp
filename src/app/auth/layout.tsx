import { Utensils } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Auth | Dineri.app',
    description: 'Auth | Dineri.app',
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-600 to-blue-600">
                <div className="w-full mx-auto flex flex-1">
                    <div className="flex w-full flex-1 flex-col lg:flex-row">
                        {/* Left side - Form */}
                        <div className="flex flex-1 flex-col justify-center py-12 lg:px-8  xl:px-12">
                            <div className="mx-auto w-full max-w-md bg-white px-6 py-7 rounded-2xl">
                                <div className="mb-5">
                                    <Link href="/" className="flex items-center space-x-2 group">
                                        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2 rounded-xl transition-transform group-hover:scale-110">
                                            <Utensils className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                            dineri.app
                                        </span>
                                    </Link>
                                </div>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
