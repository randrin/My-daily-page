import React from "react";
import AppCard from "@crema/components/AppCard";
import AppList from "@crema/components/AppList";
import RecentActivityCell from "./RecentActivityCell";
import AppScrollbar from "@crema/components/AppScrollbar";
import { useIntl } from "react-intl";
import AppMenu from "@crema/components/AppMenu";
import { RecentActivityType } from "@crema/types/models/dashboards/CRM";

type Props = {
  data: RecentActivityType[];
};
const RecentActivities = ({ data }: Props) => {
  const { messages } = useIntl();

  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.crm.recentActivities"] as string}
      action={<AppMenu />}
    >
      <AppScrollbar
        style={{
          height: 675,
        }}
      >
        <AppList
          data={data}
          renderItem={(activity) => (
            <RecentActivityCell key={activity.id} activity={activity} />
          )}
        />
      </AppScrollbar>
    </AppCard>
  );
};

export default RecentActivities;
