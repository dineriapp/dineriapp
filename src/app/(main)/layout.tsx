import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { LegalSidebar } from "@/components/shared/legal-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="bg-[#F8F9FB]">
        <div className="w-11/12 max-w-[1200px] mx-auto   lg:px-4 pb-12 lg:pt-20 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 gap-1 lg:grid-flow-col grid-flow-row-dense">
            <div className="lg:col-span-3 order-2 lg:order-1">{children}</div>
            <div className="lg:col-span-1 order-1 lg:order-2">
              <LegalSidebar />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
