"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const legalPages = [
  { name: "Cookies Policy", href: "/cookies" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms and Conditions", href: "/terms" },
];

export function LegalSidebar() {
  const pathname = usePathname();

  return (
    <div className="  lg:border-l-2 border-slate-300 lg:p-6 px-0 py-3 sticky lg:top-35">
      <h3 className="font-semibold text-slate-900 mb-4 max-lg:text-2xl">
        Legal{" "}
      </h3>
      <nav className="lg:space-y-2 max-lg:flex gap-3  flex-wrap">
        {legalPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className={cn(
              "block lg:px-3 lg:py-2 text-sm  transition-all ",
              pathname === page.href
                ? " text-[#461A86] font-medium lg:border-l-2 border-[#461A86]"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {page.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
