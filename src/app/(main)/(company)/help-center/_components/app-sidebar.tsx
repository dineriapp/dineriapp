"use client";

import * as React from "react";
import { Code, HelpCircle, Home, Sparkle, X } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Introduction",
          url: "/",
        },
        {
          title: "What's new?",
          url: "#",
        },
      ],
    },
    {
      title: "Installation",
      url: "#",
      icon: Sparkle,
      items: [
        {
          title: "Editor Setup",
          url: "#",
        },
        {
          title: "Start a new Project",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      icon: Code,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Help",
      url: "#",
      icon: HelpCircle,
      items: [
        {
          title: "FAQ",
          url: "#",
        },
        {
          title: "Support",
          url: "/support",
        },
      ],
    },
  ],
};

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
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
