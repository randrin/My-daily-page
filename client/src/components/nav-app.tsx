"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import {
  FileStack,
  ChevronRight,
  FolderKanban,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    icon: FolderKanban,
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
    icon: Bell,
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
  const { pathname } = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Espace</SidebarGroupLabel>
      <SidebarMenu>
        {overviewLinks.map((item) => (
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
        {navigationSections.map((section) => {
          const active = section.items.some((item) =>
            isActivePath(pathname, item.url),
          );
          return (
            <Collapsible
              key={`${section.title}-${active}`}
              asChild
              defaultOpen={active}
              className="group/section"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={section.title} isActive={active}>
                    <section.icon />
                    <span>{section.title}</span>
                    <ChevronRight
                      aria-hidden
                      className="ml-auto transition-transform group-data-[state=open]/section:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {section.items.map((item) => (
                      <SidebarMenuSubItem key={item.url}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath(pathname, item.url)}
                        >
                          <Link
                            href={item.url}
                            aria-current={
                              isActivePath(pathname, item.url)
                                ? "page"
                                : undefined
                            }
                          >
                            <item.icon aria-hidden />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
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
