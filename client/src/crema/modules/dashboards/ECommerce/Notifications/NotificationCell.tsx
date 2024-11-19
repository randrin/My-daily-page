import React from "react";
import { List, Avatar } from "antd";
import { StyledNoticationCell } from "./index.styled";
import type { NotificationsDataType } from "@crema/types/models/dashboards/Ecommerce";

type NotificationCellProps = {
  item: NotificationsDataType;
};

const NotificationCell: React.FC<NotificationCellProps> = ({ item }) => {
  return (
    <StyledNoticationCell>
      <List.Item.Meta
        avatar={<Avatar src={item.image} />}
        title={item.type}
        description={
          <p>
            <span> {item.name}</span>
            {item.message}
          </p>
        }
      />
    </StyledNoticationCell>
  );
};

export default NotificationCell;
