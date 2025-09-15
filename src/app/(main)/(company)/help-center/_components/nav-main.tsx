"use client";

import { BookOpen, Boxes, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
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
} from "@/components/ui/sidebar";

const navMain: {
  title: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
}[] = [
    {
      title: "Introduction",
      icon: BookOpen,
      items: [
        {
          title: "Why use this platform?",
          url: "/help-center/introduction#why-use-this-platform",
        },
        {
          title: "Who is it for?",
          url: "/help-center/introduction#who-is-it-for",
        },
        {
          title: "Key Points to Remember",
          url: "/help-center/introduction#key-Points-to-remember",
        },
      ],
    },
    {
      title: "What’s New?",
      icon: Sparkles,
      items: [
        {
          title: "New Features",
          url: "/help-center/what-is-new#new-features",
        },
        {
          title: "Improvements",
          url: "/help-center/what-is-new#improvements",
        },
        {
          title: "Coming Soon",
          url: "/help-center/what-is-new#coming-soon",
        },
      ],
    },
    {
      title: "Features",
      icon: Boxes,
      items: [
        {
          title: "Analytics",
          url: "/help-center/features#analytics",
        },
        {
          title: "Orders",
          url: "/help-center/features#orders",
        },
        {
          title: "Links",
          url: "/help-center/features#links",
        },
        {
          title: "Menu",
          url: "/help-center/features#menu",
        },
        {
          title: "Events",
          url: "/help-center/features#events",
        },
        {
          title: "FAQ",
          url: "/help-center/features#faq",
        },
        {
          title: "Popups",
          url: "/help-center/features#popups",
        },
        {
          title: "QR Codes",
          url: "/help-center/features#qr-codes",
        },
      ],
    },
  ];

export function NavMain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    setCurrentHash(window.location.hash);

    const checkHash = () => setCurrentHash(window.location.hash);

    const interval = setInterval(checkHash, 100);
    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  const isActive = (href: string) => {
    if (href.includes("#")) {
      const basePath = href.split("#")[0];
      const hash = href.split("#")[1];
      return pathname === basePath && currentHash === `#${hash}`;
    } else {
      return pathname === href && currentHash === "";
    }
  };

  return (
    <SidebarGroup className="h-full bg-white font-poppins shadow-md overflow-y-auto px-2">
      <SidebarMenu className="gap-1 py-3 pb-20">
        {navMain.map((item) => {
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
                          <Link href={subItem.url}>
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
