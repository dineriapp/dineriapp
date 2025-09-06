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
    <SidebarGroup className="h-full bg-white font-poppins shadow-md px-2">
      <SidebarMenu className="gap-1 py-3">
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
                className={`gap-2 transition-all !text-sm duration-200 px-3 py-2 rounded-none cursor-pointer ${item.isActive
                  ? "bg-gray-100 hover:bg-gray-100 text-main-action hover:text-main-action"
                  : "hover:bg-gray-100 text-main-blue hover:text-main-action"
                  }`}
              >
                <span className="flex items-center gap-2">
                  {item.icon && (
                    <item.icon
                      size={20}
                      strokeWidth={1.5}
                      className={` ${item.isActive ? "text-main-action" : "text-main-blue"}`}
                    />
                  )}
                </span>
                <span className="text-sm font-medium">{item.title}</span>
              </SidebarMenuButton>

              <SidebarMenuSub className="pl-5 ml-2 border-l border-green-300 gap-1">
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      className="rounded-none px-2 py-1.5 text-sm hover:bg-gray-100 text-main-blue transition-colors"
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
