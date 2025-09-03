import FooterMain from "@/components/shared/footer-main";
import { Header } from "@/components/shared/header";

export default function ProductsPagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="bg-[#F8F9FB] w-full grid">
                {children}
            </main>
            <FooterMain />
        </>
    );
}
