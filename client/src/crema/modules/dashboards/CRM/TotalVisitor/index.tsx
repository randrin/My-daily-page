import React from "react";
import VisitorGraph from "./VisitorGraph";
import { List } from "antd";
import Categories from "./Categories";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { StyledEarningGraphWrapper } from "./index.styled";
import { TotalVisitorType } from "@crema/types/models/dashboards/CRM";

type Props = {
  totalVisitors: TotalVisitorType[];
};
export const TotalVisitor = ({ totalVisitors = [] }: Props) => {
  const { messages } = useIntl();

  return (
    <AppCard
      title={messages["dashboard.crm.totalVisitor"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <StyledEarningGraphWrapper>
        <div className="earning-item earning-graph-item">
          <VisitorGraph totalVisitors={totalVisitors} />
        </div>
        <div className="earning-item">
          <List>
            {totalVisitors.map((category) => {
              if (category.name !== "") {
                return <Categories category={category} key={category.name} />;
              }
              return null;
            })}
          </List>
        </div>
      </StyledEarningGraphWrapper>
    </AppCard>
  );
};

export default TotalVisitor;
