"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { History } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { ReminderHistory } from "@/components/notifications/reminder-history";

export function RemindersScreen() {
  const t = useTranslator();
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <PageTitle icon={History}>
            <Localized>{t("navigation.reminders")}</Localized>
          </PageTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            <Localized>
              {t(
                "messages.reviewYourRemindersChannelsAndSendingStatus",
              )}
            </Localized>
          </p>
        </div>
        <ReminderHistory />
      </div>
    </DashboardLayout>
  );
}
