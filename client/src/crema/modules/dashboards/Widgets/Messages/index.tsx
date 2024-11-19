import React from "react";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { List, Button } from "antd";
import type { MessagesDataType } from "@crema/types/models/dashboards/Widgets";
import { CloseOutlined } from "@ant-design/icons";
import MessageItem from "@crema/components/AppHeaderMessages/MessageItem";

type MessagesProps = {
  data: MessagesDataType[];
};

const Messages: React.FC<MessagesProps> = ({ data }) => {
  const { messages } = useIntl();
  return (
    <AppCard
      heightFull
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.messages"] as string}
      extra={
        <Button className="close-btn">
          <CloseOutlined />
        </Button>
      }
    >
      <List
        dataSource={data}
        renderItem={(item) => {
          return <MessageItem key={item.id} item={item} />;
        }}
      />
    </AppCard>
  );
};

export default Messages;
