"use client";

import { Localized } from "@/i18n/provider";
import { LanguageSelect } from "@/components/language-select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderWeather } from "@/components/weather/header-weather";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { ChangePasswordSheet } from "@/components/profile/change-password-sheet";
import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "@/api/auth";
import { useState } from "react";
import { useMe } from "@/hooks/use-profile";

const pageTitles: Record<string, string> = {
  "/dashboard/admin/data": "navigation.data",
  "/dashboard/admin": "navigation.administration",
  "/dashboard/admin/audit": "navigation.audit",
  "/dashboard/admin/notifications": "messages.notificationMonitoring",
  "/dashboard/admin/analytics": "messages.usageAnalytics",
  "/dashboard/companion": "navigation.companion",
  "/dashboard/today": "navigation.today",
  "/dashboard/templates": "navigation.templates",
  "/dashboard/assistant": "navigation.assistant",
  "/dashboard/settings": "navigation.settings",
  "/dashboard": "Dashboard",
  "/dashboard/tasks": "navigation.tasks",
  "/dashboard/categories": "navigation.categories",
  "/dashboard/preferences": "navigation.notifications",
  "/dashboard/reminders": "navigation.reminders",
};

const HeaderLayout = () => {
  const { data: session } = useSession();
  const profileQuery = useMe(Boolean(session?.user));
  const profile = profileQuery.data;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const email = session?.user?.email ?? "";
  const pageTitle = pageTitles[router.pathname] ?? "Dashboard";

  const handleLogout = async () => {
    try {
      if (session?.accessToken) {
        await logoutRequest(session.accessToken);
      }
    } catch {
      // still drop the local session
    }
    queryClient.clear();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">
                <Localized>{"messages.myDailyPage"}</Localized>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage suppressHydrationWarning>
                <Localized>{pageTitle}</Localized>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        {profile?.id && <HeaderWeather userId={profile.id} />}
        <NotificationDropdown />
        <LanguageSelect />
        <ThemeToggle />
        <UserProfileDropdown
          firstName={profile?.firstName || ""}
          lastName={profile?.lastName || ""}
          email={email}
          onEditProfile={() => setProfileOpen(true)}
          onChangePassword={() => setPasswordOpen(true)}
          onLogout={handleLogout}
        />
        <EditProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
        <ChangePasswordSheet
          open={passwordOpen}
          onOpenChange={setPasswordOpen}
        />
      </div>
    </header>
  );
};

export default HeaderLayout;
