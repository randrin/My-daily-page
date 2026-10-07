"use client";

import DashboardLayout from "@/components/layout/dashboard.layout";
import { ReminderHistory } from "@/components/notifications/reminder-history";

export function RemindersScreen() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold">Historique des rappels</h1>
          <p className="text-muted-foreground">
            Consulte tes rappels, leurs canaux et le statut de chaque envoi.
          </p>
        </div>
        <ReminderHistory />
      </div>
    </DashboardLayout>
  );
}
