import { Toaster } from "@/components/ui/sonner";
import { UpgradePopup } from "@/components/upgrade-plan-popup";
import ReactQueryProvider from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dineri.app - Your restaurant, one link away',
  description: 'Create a beautiful page with all your restaurant links in one place',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // className={`${inter.className} antialiased`}
        className={` antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
          <Toaster richColors />
          <UpgradePopup />
        </ThemeProvider>
      </body>
    </html>
  );
}
