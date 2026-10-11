"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import {
  ShieldCheck,
  FileStack,
  Sun,
  Bell,
  CheckSquare,
  LayoutDashboard,
  Tags,
  Settings2,
  History,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useMe } from "@/hooks/use-profile";

const overviewLinks = [
  { title: "Page du jour", url: "/dashboard/today", icon: Sun },
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
] as const;

const navigationSections = [
  {
    title: "Organisation",
    items: [
      {
        title: "Tâches",
        url: "/dashboard/tasks",
        icon: CheckSquare,
      },
      { title: "Modèles", url: "/dashboard/templates", icon: FileStack },
      {
        title: "Catégories",
        url: "/dashboard/categories",
        icon: Tags,
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        title: "Préférences",
        url: "/dashboard/preferences",
        icon: Bell,
      },
      {
        title: "Historique des rappels",
        url: "/dashboard/reminders",
        icon: History,
      },
    ],
  },
] as const;

function isActivePath(pathname: string, url: string) {
  if (url === "/dashboard") return pathname === "/dashboard";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavApp() {
  const profile = useMe();
  const { pathname } = useRouter();

  const sections = [
    { title: "Espace", items: overviewLinks },
    ...navigationSections,
    ...(profile.data?.role === "admin"
      ? [
          {
            title: "Administration",
            items: [
              {
                title: "Utilisateurs",
                url: "/dashboard/admin",
                icon: ShieldCheck,
              },
            ],
          },
        ]
      : []),
  ];
  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.title}>
          <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, item.url)}
                  tooltip={item.title}
                >
                  <Link
                    href={item.url}
                    aria-current={
                      isActivePath(pathname, item.url) ? "page" : undefined
                    }
                  >
                    <item.icon aria-hidden />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

export function NavSettings() {
  const { pathname } = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActivePath(pathname, "/dashboard/settings")}
          tooltip="Paramètres"
        >
          <Link href="/dashboard/settings">
            <Settings2 />
            <span>Paramètres</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
