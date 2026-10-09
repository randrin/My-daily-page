import type { GetServerSideProps } from "next";
import { requireSession } from "@/auth/guards";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { TemplatesScreen } from "@/components/templates/templates-screen";
export const getServerSideProps: GetServerSideProps = requireSession;
export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <TemplatesScreen />
    </DashboardLayout>
  );
}
