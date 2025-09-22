"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Collapsible,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Locale } from "@/i18n/routing";
import { navMain } from "@/lib/help-center-nav-links";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";



export function NavMain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale: Locale = useLocale() as Locale;
  const [currentHash, setCurrentHash] = useState("");
  const { setOpenMobile } = useSidebar()

  const stripLocale = (path: string) =>
    path.replace(/^\/(en|de|es|fr|it|nl)(?=\/|$)/, "");

  useEffect(() => {
    setCurrentHash(window.location.hash);

    const checkHash = () => setCurrentHash(window.location.hash);

    const interval = setInterval(checkHash, 100);
    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  const isActive = (href: string) => {
    const [basePath, hash] = href.split("#");

    const cleanPathname = stripLocale(pathname);
    const cleanBasePath = stripLocale(basePath);

    if (hash) {
      return cleanPathname === cleanBasePath && currentHash === `#${hash}`;
    }
    return cleanPathname === cleanBasePath && !currentHash;
  };
  return (
    <SidebarGroup className="h-full bg-white font-poppins shadow-md overflow-y-auto px-2">
      <SidebarMenu className="gap-1 py-3 pb-20">
        {navMain[locale]?.map((item) => {
          const isMainActive = item.items?.some((sub) => isActive(sub.url));

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`gap-2 transition-all !text-sm duration-200 px-3 py-2 rounded-none cursor-pointer ${isMainActive
                    ? "bg-transparent text-main-action"
                    : "hover:bg-gray-100 text-main-blue hover:text-main-action"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && (
                      <item.icon
                        size={20}
                        strokeWidth={1.5}
                        className={`${isMainActive ? "text-main-action" : "text-main-blue"
                          }`}
                      />
                    )}
                  </span>
                  <span className="text-sm font-medium">{item.title}</span>
                </SidebarMenuButton>

                <SidebarMenuSub className="pl-5 ml-2 border-l border-green-300 gap-1">
                  {item.items?.map((subItem) => {
                    const isSubActive = isActive(subItem.url);
                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={`rounded-none px-2 py-1.5 text-sm transition-colors ${isSubActive
                            ? "bg-gray-100 text-main-action"
                            : "hover:bg-gray-100 text-main-blue"
                            }`}
                        >
                          <Link href={subItem.url} onClick={() => {
                            setOpenMobile(false)
                          }}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
