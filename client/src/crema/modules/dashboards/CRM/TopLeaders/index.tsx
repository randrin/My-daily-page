import React from "react";
import AppCard from "@crema/components/AppCard";
import TopLeadersTable from "./TopLeadersTable";
import { useIntl } from "react-intl";
import { TopLeaderType } from "@crema/types/models/dashboards/CRM";

type Props = {
  topLeaders: TopLeaderType[];
};
const TopLeaders = ({ topLeaders }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.crm.topLeaders"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <TopLeadersTable topLeaders={topLeaders} />
    </AppCard>
  );
};

export default TopLeaders;
