"use client";

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
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "@/api/auth";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/tasks": "Tâches",
  "/dashboard/categories": "Catégories",
  "/dashboard/preferences": "Notifications",
};

const HeaderLayout = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
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
              <BreadcrumbLink href="/">My Daily Page</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage suppressHydrationWarning>
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <NotificationDropdown />
        <ThemeToggle />
        <UserProfileDropdown
          firstName={email.split("@")[0] || "compte"}
          lastName=""
          email={email}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
};

export default HeaderLayout;
