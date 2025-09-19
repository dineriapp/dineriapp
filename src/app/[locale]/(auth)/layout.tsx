import type { Metadata } from "next";
import Image from "next/image";
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
            <div className="flex min-h-screen flex-col bg-main-blue">
                <div className="w-full mx-auto flex flex-1">
                    <div className="flex w-full flex-1 flex-col lg:flex-row">
                        {/* Left side - Form */}
                        <div className="flex flex-1 flex-col justify-center py-12 lg:px-8  xl:px-12">
                            <div className="mx-auto w-full max-w-md bg-white px-6 py-7 rounded-2xl">
                                <Link href={"/"} className="mb-5">
                                    <Image
                                        src={"/logo.png"}
                                        alt="logo.png"
                                        width={250}
                                        height={100}
                                        className="w-full max-w-[170px] "
                                    />
                                </Link>
                                <div className="w-full my-3">

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
