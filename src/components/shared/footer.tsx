import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Utensils,
} from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#0a0f1a] via-[#111827] to-[#0a0f1a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-[800px] w-[800px] rounded-full bg-main-action/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-main/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-main-action/5 blur-2xl"></div>
      </div>

      <div className="container relative mx-auto max-w-[1200px] px-4 ">
        {/* Footer Main */}
        <div className="flex items-start justify-between 900:flex-row flex-col gap-10 pt-12 md:pt-16 pb-6 md:pb-6">
          <div className="md:col-span-2 max-w-[400px]">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-main-action to-main p-2 rounded-xl">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-main-action to-white bg-clip-text text-transparent">
                dineri.app
              </span>
            </Link>
            <p className="mt-4 text-white">
              The complete platform for restaurants to create a beautiful online
              presence and connect with customers through a single, powerful
              link.
            </p>
            <div className="mt-6 flex space-x-4">
              {[
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Linkedin, href: "https://linkedin.com" },
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={i}
                    href={social.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b] text-white transition-colors hover:bg-[#334155] hover:text-main-action ring-1 ring-main-action/50"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">
                      {social.href.split("https://")[1]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-start sm:flex-row flex-col justify-between 900:w-auto w-full 900:justify-center gap-6 sm:gap-30">
            <div>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-main-action">
                Product
              </h3>
              <ul className="space-y-2">

                {[
                  { name: "Features", path: "/features" },
                  { name: "Demo", path: "/demo" },
                  { name: "Plans", path: "/plans" },
                  { name: "Pricing", path: "#Pricing" },
                  { name: "Testimonials", path: "#Testimonials" },
                  { name: "FAQ", path: "#FAQ" },
                  { name: "Support", path: "#Support" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`${item.path.toLowerCase()}`}
                      className="text-white/90 hover:text-main-action"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-main-action">
                Company
              </h3>
              <ul className="space-y-2">
                {[
                  { name: "About", path: "/about" },
                  { name: "Careers", path: "/careers" },
                  { name: "Help Center", path: "/help-center" },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      href={`${item.path}`}
                      className="text-white/90 hover:text-main-action"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-main-action">
                Legal
              </h3>
              <ul className="space-y-4">
                {[
                  { name: "Terms", path: "/terms" },
                  { name: "Privacy", path: "/privacy-policy" },
                  { name: "Cookies", path: "/cookies" },
                  { name: "Licenses", path: "#licenses" },
                ].map((item, index) => (
                  // {["Terms", "Privacy", "Cookies", "Licenses"].map((item) => (
                  <li key={index}>
                    <Link
                      href={`${item.path}`}
                      className="text-white/90 hover:text-main-action"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Get Started Banner */}
        <div className="my-8 rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-xl font-bold text-white md:text-2xl">
                Ready to get started?
              </h3>
              <p className="mt-2 text-white/80">
                Create your restaurant profile in minutes
              </p>
            </div>
            <Link href="/signup">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-main-action to-main hover:from-[#29b765] hover:to-[#001e3a]"
              >
                Create your page
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col items-center justify-between border-t border-[#334155]/50 py-8 md:flex-row">
          <p className="mb-4 text-center text-white md:mb-0">
            © {new Date().getFullYear()} dineri.app. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white">
            <Link href="/terms" className="hover:text-main-action">
              Terms of Service
            </Link>
            <span className="text-white/80">•</span>
            <Link href="/privacy-policy" className="hover:text-main-action">
              Privacy Policy
            </Link>
            <span className="text-white/80">•</span>
            <Link href="/cookies" className="hover:text-main-action">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
