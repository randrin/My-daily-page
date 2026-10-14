"use client";

import HeaderLayout from "@/components/layout/header.layout";
import SidebarLayout from "@/components/layout/sidebar.layout";
import FooterLayout from "@/components/layout/footer.layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { signOut, useSession } from "next-auth/react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();

  React.useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/auth/signin" });
    }
  }, [session?.error]);

  return (
    <SidebarProvider>
      <SidebarLayout />
      <SidebarInset className="flex h-svh min-h-0 flex-col overflow-hidden">
        <HeaderLayout />
        <div
          data-slot="dashboard-scroller"
          className="flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6"
        >
          {children}
        </div>
        <FooterLayout />
      </SidebarInset>
    </SidebarProvider>
  );
};
export default DashboardLayout;
