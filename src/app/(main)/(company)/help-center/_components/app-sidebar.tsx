"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { X } from "lucide-react";

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="mt-12">
      <div className="absolute top-1  right-1 z-50 block md:hidden">
        <SidebarTrigger>
          <X size={35} />
        </SidebarTrigger>
      </div>
      <SidebarHeader></SidebarHeader>
      <SidebarContent className="font-inter">
        <NavMain />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
