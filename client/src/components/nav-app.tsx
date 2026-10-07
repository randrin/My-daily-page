"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Bell, CheckSquare, LayoutDashboard, Tags, Settings2, History } from "lucide-react";
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
  {
    title: "Historique des rappels",
    url: "/dashboard/reminders",
    icon: History,
  },
] as const;

function isActivePath(pathname: string, url: string) {
  if (url === "/dashboard") return pathname === "/dashboard";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavApp() {
  const { pathname } = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Espace</SidebarGroupLabel>
      <SidebarMenu>
        {appLinks.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={isActivePath(pathname, item.url)}
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

export function NavSettings() {
  const { pathname } = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActivePath(pathname, "/dashboard/settings")} tooltip="Paramètres">
          <Link href="/dashboard/settings">
            <Settings2 />
            <span>Paramètres</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
