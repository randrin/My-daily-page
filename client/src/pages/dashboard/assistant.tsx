import type { GetServerSideProps } from "next";
import { requireSession } from "@/auth/guards";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { AssistantScreen } from "@/components/assistant/assistant-screen";
export const getServerSideProps: GetServerSideProps = requireSession;
export default function AssistantPage() {
  return (
    <DashboardLayout>
      <AssistantScreen />
    </DashboardLayout>
  );
}
