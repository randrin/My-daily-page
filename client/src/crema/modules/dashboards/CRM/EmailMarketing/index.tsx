import React from "react";
import AppCard from "@crema/components/AppCard";
import Categories from "./Categories";
import { useIntl } from "react-intl";
import ChartView from "./ChartView";
import { StyledChartViewWrapper } from "./index.styled";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import SidebarPlaceholder from "@crema/components/AppSkeleton/SidebarListSkeleton";
import AppGrid from "@crema/components/AppGrid";
import { EmailMarketingType } from "@crema/types/models/dashboards/CRM";

type Props = {
  emailMarketing: EmailMarketingType[];
};
export const EmailMarking = ({ emailMarketing = [] }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard title={messages["dashboard.crm.emailMarketing"] as string}>
      <StyledChartViewWrapper>
        <ChartView data={emailMarketing} />
      </StyledChartViewWrapper>
      <AppGrid
        data={emailMarketing}
        ListEmptyComponent={
          <ListEmptyResult
            loading={true}
            placeholder={<SidebarPlaceholder />}
          />
        }
        renderItem={(category) => {
          return <Categories category={category} key={category.id} />;
        }}
      />
    </AppCard>
  );
};

export default EmailMarking;
