import DashboardLayout from "@/components/layout/dashboard.layout";
import { AdminNotifications } from "@/components/admin-notifications";
export { requireAdmin as getServerSideProps } from "@/auth/admin.guard";
export default function AdminNotificationsPage() {
  return (
    <DashboardLayout>
      <AdminNotifications />
    </DashboardLayout>
  );
}
