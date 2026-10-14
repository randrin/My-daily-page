import DashboardLayout from "@/components/layout/dashboard.layout";
import { AdminAnalytics } from "@/components/admin-analytics";
export { requireAdmin as getServerSideProps } from "@/auth/admin.guard";
export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout>
      <AdminAnalytics />
    </DashboardLayout>
  );
}
