"use client";

import { History } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { ReminderHistory } from "@/components/notifications/reminder-history";

export function RemindersScreen() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <PageTitle icon={History}>Historique des rappels</PageTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulte tes rappels, leurs canaux et le statut de chaque envoi.
          </p>
        </div>
        <ReminderHistory />
      </div>
    </DashboardLayout>
  );
}
