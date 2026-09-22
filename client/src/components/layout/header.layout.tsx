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
import { useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "@/api/auth";

const HeaderLayout = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const email = session?.user?.email ?? "";

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
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
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
