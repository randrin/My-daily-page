"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Bell, CheckSquare, LayoutDashboard, Tags } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const appLinks = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tâches",
    url: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    title: "Catégories",
    url: "/dashboard/categories",
    icon: Tags,
  },
  {
    title: "Notifications",
    url: "/dashboard/preferences",
    icon: Bell,
  },
] as const;

function isActivePath(pathname: string, url: string) {
  if (url === "/dashboard") return pathname === "/dashboard";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavApp() {
  const { pathname } = useRouter();
  const [activePath, setActivePath] = React.useState<string | null>(null);

  React.useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Espace</SidebarGroupLabel>
      <SidebarMenu>
        {appLinks.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={
                activePath ? isActivePath(activePath, item.url) : false
              }
              tooltip={item.title}
            >
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
