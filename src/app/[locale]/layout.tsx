import { Toaster } from "@/components/ui/sonner";
import { UpgradePopup } from "@/components/upgrade-plan-popup";
import ReactQueryProvider from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { redirect } from "next/navigation";
import "./globals.css";
// import { Roboto, Inter, Lora, Poppins, Open_Sans, Merriweather, Montserrat, Playfair_Display, Space_Grotesk } from 'next/font/google';
import { Space_Grotesk } from 'next/font/google';

export const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// export const inter = Inter({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   variable: "--font-inter",
//   display: "swap",
// });

// export const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["100", "300", "400", "500", "700", "900"], // Roboto skips 200, 600, 800
//   variable: "--font-roboto",
//   display: "swap",
// });

// export const lora = Lora({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"], // serif style, fewer weights
//   variable: "--font-lora",
//   display: "swap",
// });

// export const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   variable: "--font-poppins",
//   display: "swap",
// });

// export const openSans = Open_Sans({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   variable: "--font-open-sans",
//   display: "swap",
// });

// export const merriweather = Merriweather({
//   subsets: ["latin"],
//   weight: ["300", "400", "700", "900"],
//   variable: "--font-merriweather",
//   display: "swap",
// });

// export const montserrat = Montserrat({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   variable: "--font-montserrat",
//   display: "swap",
// });

// export const playfairDisplay = Playfair_Display({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800", "900"],
//   variable: "--font-playfair-display",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: {
    absolute: 'Dineri.app – All Your Restaurant Links in One Place',
    default: 'Dineri.app',
    template: '%s | Dineri.app'
  },
  description: 'Dineri helps restaurants create beautiful, shareable pages with all their important links in one place — from menus and reservations to delivery and social media.',
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {

  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    redirect(routing.defaultLocale);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        // className={`${inter.variable} ${roboto.variable} ${lora.variable} ${poppins.variable} ${openSans.variable} ${merriweather.variable} ${montserrat.variable} ${playfairDisplay.variable} ${space.variable} antialiased`}
        className={`${space.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            themes={["light"]}
          >
            <ReactQueryProvider>
              {children}
            </ReactQueryProvider>
            <Toaster richColors />
            <UpgradePopup />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
