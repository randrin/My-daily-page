import DashboardLayout from "@/components/layout/dashboard.layout";
import { AdminAudit } from "@/components/admin-audit";
export { requireAdmin as getServerSideProps } from "@/auth/admin.guard";
export default function AdminAuditPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminAudit />
      </div>
    </DashboardLayout>
  );
}
