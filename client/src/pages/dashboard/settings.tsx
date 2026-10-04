import type { GetServerSideProps } from "next";
import { requireSession } from "@/auth/guards";
import { TaskSettingsScreen } from "@/components/task-settings-screen";
import DashboardLayout from "@/components/layout/dashboard.layout";
export const getServerSideProps: GetServerSideProps = requireSession;

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <TaskSettingsScreen />
    </DashboardLayout>
  );
}
