import { Toaster } from "@/components/ui/sonner";
import { UpgradePopup } from "@/components/upgrade-plan-popup";
import ReactQueryProvider from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import { Roboto, Inter, Lora, Poppins, Open_Sans, Merriweather, Montserrat, Playfair_Display } from 'next/font/google';

export const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"], // Roboto skips 200, 600, 800
  variable: "--font-roboto",
  display: "swap",
});

export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // serif style, fewer weights
  variable: "--font-lora",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair-display",
  display: "swap",
});

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
        className={`${inter.variable} ${roboto.variable} ${lora.variable} ${poppins.variable} ${openSans.variable} ${merriweather.variable} ${montserrat.variable} ${playfairDisplay.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
