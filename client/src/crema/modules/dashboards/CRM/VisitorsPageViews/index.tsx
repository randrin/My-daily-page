import React from "react";
import StatGraphs from "./StatGraphs";
import { useIntl } from "react-intl";
import AppSelect from "@crema/components/AppSelect";
import { StyledVisitorAction, StyledVisitorCard } from "./index.styled";
import { VisitorPageViewType } from "@crema/types/models/dashboards/CRM";

type Props = {
  data: VisitorPageViewType[];
};
const VisitorsPageViews = ({ data = [] }: Props) => {
  const handleSelectionType = (data: VisitorPageViewType) => {
    console.log("data: ", data);
  };
  const { messages } = useIntl();

  return (
    <StyledVisitorCard
      title={messages["dashboard.crm.visitorsPageViews"]}
      extra={
        <StyledVisitorAction>
          <div className="visitor-action-view">
            <div className="visitor-action-item">
              <span
                className="dot-visitor"
                style={{ backgroundColor: "#0A8FDC" }}
              />
              {messages["dashboard.crm.pagesViews"] as string}
            </div>
            <div className="visitor-action-item">
              <span
                className="dot-visitor"
                style={{ backgroundColor: "#F04F47" }}
              />
              {messages["dashboard.crm.visitors"] as string}
            </div>
          </div>
          <AppSelect
            menus={[
              messages["dashboard.thisWeek"],
              messages["dashboard.lastWeeks"],
              messages["dashboard.lastMonth"],
            ]}
            defaultValue={messages["dashboard.thisWeek"]}
            onChange={handleSelectionType}
          />
        </StyledVisitorAction>
      }
    >
      <StatGraphs data={data} />
    </StyledVisitorCard>
  );
};
export default VisitorsPageViews;
