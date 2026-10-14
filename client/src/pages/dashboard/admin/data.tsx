import DashboardLayout from "@/components/layout/dashboard.layout";
import { AdminData } from "@/components/admin-data";
export { requireAdminOnly as getServerSideProps } from "@/auth/admin.guard";
export default function AdminDataPage() {
  return (
    <DashboardLayout>
      <AdminData />
    </DashboardLayout>
  );
}
