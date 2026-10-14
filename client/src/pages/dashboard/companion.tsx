import DashboardLayout from "@/components/layout/dashboard.layout";
import { CompanionScreen } from "@/components/companion-screen";
export { requireSession as getServerSideProps } from "@/auth/guards";
export default function CompanionPage() {
  return (
    <DashboardLayout>
      <CompanionScreen />
    </DashboardLayout>
  );
}
