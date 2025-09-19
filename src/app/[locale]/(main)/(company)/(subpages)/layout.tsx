"use client";
import FooterMain from "@/components/shared/footer-main";
import { Header } from "@/components/shared/header";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/help-center" && <Header />}
      <div className="bg-[white]">
        {children}
      </div>

      {pathname !== "/help-center" && <FooterMain />}
    </>
  );
}
