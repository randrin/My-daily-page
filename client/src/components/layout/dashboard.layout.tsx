import HeaderLayout from "@/components/layout/header.layout";
import SidebarLayout from "@/components/layout/sidebar.layout";
import FooterLayout from "@/components/layout/footer.layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <SidebarLayout />
      <SidebarInset className="flex flex-col">
        <HeaderLayout />
        <div className="flex flex-1 flex-col overflow-auto">
          {children}
        </div>
        <FooterLayout />
      </SidebarInset>
    </SidebarProvider>
  );
};
export default DashboardLayout;
