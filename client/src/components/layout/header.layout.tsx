import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";

const HeaderLayout = () => {
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
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <NotificationDropdown />
              <ThemeToggle />
              <UserProfileDropdown
                firstName="John"
                lastName="Doe"
                email="john.doe@example.com"
                onEditProfile={() => {
                  // Handle edit profile
                  console.log("Edit profile clicked");
                }}
                onChangePassword={() => {
                  // Handle change password
                  console.log("Change password clicked");
                }}
                onLogout={() => {
                  // Handle logout
                  console.log("Logout clicked");
                }}
              />
            </div>
    </header>
  );
};

export default HeaderLayout;
