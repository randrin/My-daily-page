import React from "react";
import NotificationItem from "@crema/components/AppNotifications/NotificationItem";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { CloseOutlined } from "@ant-design/icons";
import { Button, List } from "antd";
import { StyledRecentActivityScrollbar } from "./index.styled";
import type { RecentActivityDataType } from "@crema/types/models/dashboards/Widgets";

type RecentActivityProps = {
  data: RecentActivityDataType[];
};

const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  const { messages } = useIntl();
  return (
    <AppCard
      heightFull
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.recentActivity"] as string}
      extra={
        <Button className="close-btn">
          <CloseOutlined />
        </Button>
      }
    >
      <StyledRecentActivityScrollbar>
        <List
          dataSource={data}
          renderItem={(item) => {
            return <NotificationItem item={item} key={item.id} />;
          }}
        />
      </StyledRecentActivityScrollbar>
    </AppCard>
  );
};

export default RecentActivity;
