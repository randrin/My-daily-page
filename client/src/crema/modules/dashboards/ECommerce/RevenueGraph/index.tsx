import AppCard from "@crema/components/AppCard";
import AppList from "@crema/components/AppList";
import React from "react";
import AppScrollbar from "@crema/components/AppScrollbar";
import { useIntl } from "react-intl";
import {
  StyledContent,
  StyledFlex,
  StyledPadding,
  StyledTitle,
} from "./index.styled";
import { Progress } from "antd";
import { RevenueItemType } from "@crema/types/models/dashboards/Ecommerce";

type RevenueItemProps = {
  item: RevenueItemType;
};

const RevenueItem = ({ item }: RevenueItemProps) => {
  return (
    <StyledPadding key={item.id} className="item-hover">
      <StyledFlex>
        <StyledTitle>{item.name}</StyledTitle>
        <StyledContent>{item.value}%</StyledContent>
      </StyledFlex>
      <Progress
        type="line"
        showInfo={false}
        percent={item.value}
        strokeWidth={3}
        strokeColor="#0A8FDC"
      />
    </StyledPadding>
  );
};

type RevenueProps = {
  revenueData: RevenueItemType[];
};

const Revenue = ({ revenueData }: RevenueProps) => {
  const { messages } = useIntl();
  return (
    <AppCard
      title={messages["dashboard.eCommerce.revenue"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
      className="no-card-space-ltr-rtl"
    >
      <AppScrollbar style={{ maxHeight: 200 }}>
        <AppList
          animation="transition.slideRightBigIn"
          data={revenueData}
          renderItem={(data, index) => <RevenueItem key={index} item={data} />}
        />
      </AppScrollbar>
    </AppCard>
  );
};

export default Revenue;
