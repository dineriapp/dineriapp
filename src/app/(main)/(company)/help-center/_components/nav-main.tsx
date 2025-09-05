"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";

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

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup className="h-full bg-gradient-to-b from-blue-50 to-green-100 font-poppins shadow-md">
      <SidebarMenu className="gap-1 p-3">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={item.title}
                className={`gap-4 transition-all duration-200 rounded-lg px-3 py-2 cursor-pointer ${item.isActive
                  ? "bg-green-500 hover:bg-green-400 text-white hover:text-white"
                  : "hover:bg-green-500 text-green-800 hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-2">
                  {item.icon && (
                    <item.icon
                      size={20}
                      strokeWidth={1.5}
                      className={` ${item.isActive ? "text-white" : "text-green-600"}`}
                    />
                  )}
                </span>
                <span className="text-base font-medium">{item.title}</span>
              </SidebarMenuButton>

              <SidebarMenuSub className="pl-5 ml-2 mt-1 border-l border-green-300 gap-1">
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      className="rounded-md px-2 py-1.5 text-sm hover:bg-green-200 text-green-700 transition-colors"
                    >
                      <Link href={`/help-center${subItem.url}`}>
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
