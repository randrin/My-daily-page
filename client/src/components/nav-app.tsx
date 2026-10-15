"use client";

import { useTranslator } from "@/i18n/provider";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Users,
  Download,
  ShieldCheck,
  ScrollText,
  Activity,
  ChartNoAxesCombined,
  Sparkles,
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
  { title: "navigation.today", url: "/dashboard/today", icon: Sun },
  {
    title: "navigation.dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
] as const;

const navigationSections = [
  {
    title: "navigation.organization",
    items: [
      {
        title: "navigation.companion",
        url: "/dashboard/companion",
        icon: Users,
      },
      { title: "navigation.assistant", url: "/dashboard/assistant", icon: Sparkles },
      {
        title: "navigation.tasks",
        url: "/dashboard/tasks",
        icon: CheckSquare,
      },
      { title: "navigation.templates", url: "/dashboard/templates", icon: FileStack },
      {
        title: "navigation.categories",
        url: "/dashboard/categories",
        icon: Tags,
      },
    ],
  },
  {
    title: "navigation.notifications",
    items: [
      {
        title: "navigation.preferences",
        url: "/dashboard/preferences",
        icon: Bell,
      },
      {
        title: "navigation.reminders",
        url: "/dashboard/reminders",
        icon: History,
      },
    ],
  },
] as const;

function isActivePath(pathname: string, url: string) {
  if (url === "/dashboard/admin") return pathname === url;
  if (url === "/dashboard") return pathname === "/dashboard";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavApp() {
  const t = useTranslator();
  const profile = useMe();
  const { pathname } = useRouter();

  const sections = [
    { title: "navigation.workspace", items: overviewLinks },
    ...navigationSections,
    ...(profile.data?.role === "admin" || profile.data?.role === "support"
      ? [
          {
            title: "navigation.administration",
            items: [
              ...(profile.data?.role === "admin"
                ? [
                    {
                      title: "navigation.data",
                      url: "/dashboard/admin/data",
                      icon: Download,
                    },
                  ]
                : []),
              {
                title: "navigation.users",
                url: "/dashboard/admin",
                icon: ShieldCheck,
              },
              {
                title: "navigation.analytics",
                url: "/dashboard/admin/analytics",
                icon: ChartNoAxesCombined,
              },
              {
                title: "navigation.monitoring",
                url: "/dashboard/admin/notifications",
                icon: Activity,
              },
              {
                title: "navigation.audit",
                url: "/dashboard/admin/audit",
                icon: ScrollText,
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
          <SidebarGroupLabel>{t(section.title)}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, item.url)}
                  tooltip={t(item.title)}
                >
                  <Link
                    href={item.url}
                    aria-current={
                      isActivePath(pathname, item.url) ? "page" : undefined
                    }
                  >
                    <item.icon aria-hidden />
                    <span>{t(item.title)}</span>
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
  const t = useTranslator();
  const { pathname } = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActivePath(pathname, "/dashboard/settings")}
          tooltip={t("navigation.settings")}
        >
          <Link href="/dashboard/settings">
            <Settings2 />
            <span>
              {t("navigation.settings")}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
