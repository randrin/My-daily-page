import React from "react";
import AppCard from "@crema/components/AppCard";
import NotificationCell from "./NotificationCell";
import { List } from "antd";
import { useIntl } from "react-intl";
import AppMenu from "@crema/components/AppMenu";
import { StyledNotificationScrollbar } from "./index.styled";
import type { NotificationsDataType } from "@crema/types/models/dashboards/Ecommerce";

type NotificationsProps = {
  notifications: NotificationsDataType[];
};

const NotificationsEcom: React.FC<NotificationsProps> = ({ notifications }) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["eCommerce.notifications"] as string}
      extra={<AppMenu />}
    >
      <StyledNotificationScrollbar>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => <NotificationCell key={item.id} item={item} />}
        />
      </StyledNotificationScrollbar>
    </AppCard>
  );
};

export default NotificationsEcom;
