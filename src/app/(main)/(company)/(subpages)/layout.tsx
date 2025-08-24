"use client";
import { Footer } from "@/components/shared/footer";
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
      <div className="bg-[#F8F9FB]">{children}</div>

      {pathname !== "/help-center" && <Footer />}
    </>
  );
}
