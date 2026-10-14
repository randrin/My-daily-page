import { AdminScreen } from "@/components/admin-screen";
import DashboardLayout from "@/components/layout/dashboard.layout";
export { requireAdmin as getServerSideProps } from "@/auth/admin.guard";
export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminScreen />
    </DashboardLayout>
  );
}
