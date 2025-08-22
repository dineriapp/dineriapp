import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="bg-[#F8F9FB]">{children}</div>
      <Footer />
    </>
  );
}
